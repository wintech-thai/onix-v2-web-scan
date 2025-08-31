from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello, Flask!"

@app.route("/verify")
@app.route("/verify-dev")
def verify():
    return "This is verification page."

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
