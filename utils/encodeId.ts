// utils/tonMessageEncoder.js
import TonWeb from "tonweb";

const { Cell } = TonWeb.boc;

/**
 * Кодирует текстовое сообщение в формате TON BOC Cell и возвращает строку BOC.
 * @param {string} message - Текст сообщения для отправки.
 * @returns {Promise<string>} - Закодированная строка BOC.
 */
export async function encodeTonMessage(message) {
    try {
        const commentBuffer = Buffer.from(message, "utf-8");
        const commentCell = new Cell();

        commentCell.bits.writeUint(0, 32); // Опкод (0 по умолчанию)
        commentBuffer.forEach(byte => commentCell.bits.writeUint(byte, 8)); // Записываем каждый байт сообщения

        const boc = await commentCell.toBoc(false); // Асинхронный вызов сериализации BOC
        const bocString = Buffer.from(boc).toString("base64"); // Конвертация BOC в Base64

        console.log("Encoded BOC String:", bocString); // Логируем результат
        return bocString;
    } catch (error) {
        console.error("Ошибка при кодировании сообщения:", error);
        throw new Error("Failed to encode TON message.");
    }
}

// Пример вызова функции для проверки
console.log(encodeTonMessage("whanarchyvven"))
