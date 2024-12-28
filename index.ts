import TonWeb from "tonweb";
import axios from "axios";
import {decryptTransactionId} from "./utils/cryptTransactionId.ts";

// Типизация транзакции
interface Transaction {
    utime: number;
    in_msg?: {
        msg_data?: {
            "@type": string;
            text?: string;
            body?: string;
        };
        message: string;
        value: string; // Сумма транзакции в нанотонах
    };
}

// Константы
const API_URL = "https://testnet.toncenter.com/api/v2/";
const ADDRESS = "0QBZ-J9_d36BQtOxCJRVgKqk3rJT44TlltSzd_ss8_aLIAbH";
const BACKEND_URL = "http://localhost:3001";
const ADMIN_ID = 'ek5bgjz49ryj'

// Функция для получения транзакций
async function getTransactions(address: string): Promise<Transaction[]> {
    try {
        const response = await axios.get(`${API_URL}getTransactions?address=${address}&archival=true`);
        const data = response.data;

        if (data.ok) return data.result as Transaction[];
        throw new Error("Ошибка получения транзакций");
    } catch (error) {
        console.error("Ошибка:", error);
        return [];
    }
}

function filterTransactions(transactions: Transaction[]) {
    const textTransactions: Transaction[] = [];
    const rawTransactions: Transaction[] = [];

    for (const tx of transactions) {
        const msgDataType = tx.in_msg?.msg_data?.["@type"];
        if (msgDataType === "msg.dataText") {
            textTransactions.push(tx);
        } else if (msgDataType === "msg.dataRaw") {
            rawTransactions.push(tx);
        }
    }

    return {textTransactions, rawTransactions};
}

// Проверка транзакций и отправка POST-запроса
async function checkTransactions(): Promise<void> {
    console.log("Проверка транзакций...");

    const transactions = await getTransactions(ADDRESS);
    const {textTransactions} = filterTransactions(transactions);

    console.log(transactions.length,"TRANSACTIONS LENGTH")

    for (const tx of textTransactions) {
        if (tx.in_msg?.message && tx.in_msg?.value) {
            try {
                const comment = decryptTransactionId(tx.in_msg.message as string);
                console.log("DECRYPTED COMMENT:", comment);

                if (comment) {
                    const dbTransaction = await axios.get(`${BACKEND_URL}/transaction/${comment}`);
                    const dbAmount = dbTransaction.data.amount; // Сумма из БД
                    const blockchainAmountTON = parseFloat(tx.in_msg.value) / 1e9; // Конвертация суммы из нанотонов в TON

                    console.log(`Сумма из БД: ${dbAmount} TON`);
                    console.log(`Сумма из блокчейна: ${blockchainAmountTON.toFixed(9)} TON`);

                    if (Math.abs(dbAmount - blockchainAmountTON) < 1e-9) {
                        console.log("Сумма совпадает.");
                        if(dbTransaction.data.status=='pending'){
                            const resp = await axios.post(`${BACKEND_URL}/transaction/${comment}/approve`, {}, {
                                headers: {
                                    Authorization: ADMIN_ID
                                }
                            })
                            console.log(resp,"Транзакция выполнена")
                        }
                        else{
                            console.warn(`Транзакция ${comment} уже выполнена или отменена`)
                        }

                    } else {
                        console.error("Сумма не совпадает!");
                    }
                }
            } catch (e) {
                console.error("Ошибка:", e.message);
            }
        }
    }
}

// Интервал для регулярного запуска проверки
setInterval(() => {
    checkTransactions().catch((err) => console.error(err));
}, 15000);
