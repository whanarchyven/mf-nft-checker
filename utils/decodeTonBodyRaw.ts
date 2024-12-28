import TonWeb from "tonweb";

const { Cell } = TonWeb.boc;

/**
 * Декодирует строку BOC из Base64 обратно в текстовое сообщение.
 * @param {string} base64 - Строка BOC в формате Base64.
 * @returns {string} - Декодированное текстовое сообщение.
 */
export function decodeTonMessage(base64: string): string {
    try {
        const buffer = Buffer.from(base64, "base64"); // Конвертируем Base64 в буфер
        const cell = Cell.fromBoc(buffer)[0]; // Парсим BOC и получаем первую ячейку

        // Читаем данные из ячейки (пропускаем опкод 4 байта)
        const bits = cell.bits.getTopUppedArray();
        const messageBytes = bits.slice(4); // Пропускаем 4 байта опкода

        // Конвертируем оставшиеся байты в строку UTF-8
        const message = Buffer.from(messageBytes).toString("utf-8").replace(/\0/g, "");
        return message.trim();
    } catch (error) {
        console.error("Ошибка при декодировании BOC:", error);
        return "";
    }
}
