from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello, Flask!"

@app.route("/verify")
def verify():
    return "This is verification page."

if __name__ == "__main__":
    app.run(debug=True)
