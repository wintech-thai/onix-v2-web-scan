import os
from flask import Flask, request
from dotenv import load_dotenv
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import base64

load_dotenv()
app = Flask(__name__)

@app.route("/")
def home():
    return "Hello, Flask!"

@app.route("/verify")
@app.route("/verify-dev")
def verify():
    data_b64 = request.args.get("data")
    if not data_b64:
        return "No data provided", 400
    
    try:
        # แปลงจาก base64 -> bytes
        # print(f"data --> {data_b64}")
        data_bytes = base64.b64decode(data_b64)
    except Exception as e:
        return f"Invalid base64: {str(e)}", 400

    # สมมุติว่าข้อมูลจริงเป็นข้อความ UTF-8
    try:
        key = os.getenv("ENCRYPTION_KEY")
        iv = os.getenv("ENCRYPTION_IV")
        #decoded_text = decrypt(data_bytes, key, iv)
        decoded_text = data_bytes
    except Exception as e:
        return f"Decrypt error: {str(e)}", 400

    return decoded_text

def decrypt(cipher_bytes: str, key: str, iv: str) -> str:
    # แปลง key/iv จาก string -> bytes
    #print(f"key --> {key}")
    #print(f"iv --> {iv}")

    key_bytes = key.encode("utf-8")
    iv_bytes = iv.encode("utf-8")

    # ตั้งค่า AES CBC
    cipher = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)

    # ถอดรหัสแล้ว unpad
    plain_bytes = unpad(cipher.decrypt(cipher_bytes), AES.block_size)

    return plain_bytes.decode("utf-8")

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
