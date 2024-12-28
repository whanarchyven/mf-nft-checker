import crypto from "crypto";

// Создание SECRET_KEY
const SECRET_KEY = crypto.createHash("sha256").update("EBANY_ROT_ETOGO_KAZINO").digest();
console.log(process.env.SECRET_KEY)
export function encryptTransactionId(transactionId: string): string {
    const IV = crypto.randomBytes(16); // Генерация уникального IV
    console.log("Шифрование - IV (Base64):", IV.toString("base64"));
    const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, IV);
    let encrypted = cipher.update(transactionId, "utf8", "base64");
    encrypted += cipher.final("base64");
    return `${IV.toString("base64")}:${encrypted}`;
}
// Функция дешифрования
export function decryptTransactionId(encryptedData: string): string {
    const [iv, encrypted] = encryptedData.split(":");
    if (!iv || !encrypted) {
        throw new Error("Некорректный формат зашифрованных данных");
    }

    console.log("Дешифрование - IV (Base64):", iv);
    console.log("Дешифрование - Encrypted Data:", encrypted);

    const ivBuffer = Buffer.from(iv, "base64");
    if (ivBuffer.length !== 16) {
        throw new Error("Некорректная длина IV");
    }

    const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, ivBuffer);

    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}