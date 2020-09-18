import os

from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session, url_for
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, lookup, usd

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")

# Make sure API key is set
if not os.environ.get("API_KEY"):
    raise RuntimeError("API_KEY not set")


@app.route("/")
@login_required
def index():
    buy=db.execute("SELECT symbol, company, SUM(shares) AS sum FROM buy WHERE user_id= :user_id GROUP BY symbol", user_id=session["user_id"])
    tab=[{} for i in range(len(buy))]
    holder=0
    for j in range(len(buy)):
        tab[j]["symbol"]=buy[j]["symbol"]

        # checking lastest price
        val=lookup(buy[j]["symbol"])

        # adding latest price to dictionary
        tab[j]["price"]=val["price"]

        tab[j]["company"]=buy[j]["company"]
        tab[j]["sum"]=buy[j]["sum"]

        #adding the total price to list
        total=int(buy[j]["sum"]) * tab[j]["price"]
        tab[j]["total"]=format(total, '.2f')

        # add all the total balances
        holder+=total

    # to get the cash balance
    bal=db.execute("SELECT cash FROM users WHERE id=:id", id=session["user_id"])
    balance=bal[0]['cash']

    presentbal=balance-holder
    balance='{:,.2f}'.format(balance)
    currentbal='{:,.2f}'.format(presentbal)

    return render_template("index.html", buy=tab, balance=balance, currentbal=currentbal)
    #"""Show portfolio of stocks"""
    #return apology("TODO")


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    """Buy shares of stock"""

    if request.method == 'GET':
        return render_template("buy.html")
    else:
        symbol=request.form.get("symbol")
        # if shares name field is blank
        if not symbol:
            return apology("must enter symbol", 403)

        # lookup symbol
        val = lookup(symbol)
        if val == None:
            return apology("symbol not found", 403)

        shares = request.form.get("shares")
        # if shares number is blank
        if not shares:
            return apology("must enter shares", 403)

        # checks if number of shares is not a number
        if not shares.isnumeric():
            return apology("numbers only", 403)

        if int(shares) < 1:
            return apology("enter positive integer", 403)

        c=db.execute("SELECT cash FROM users WHERE id = :id", id=session["user_id"])
        cash=c[0]["cash"]
        price = int(val["price"]) * int(shares)

        #check if user cannot afford share at that quantity
        if cash < int(price):
            return apology("cannot afford that much")

        db.execute("INSERT INTO buy(user_id, shares, symbol, company, price) VALUES(:user_id, :shares, :symbol, :company, :price)", user_id=session["user_id"], shares=shares, symbol=symbol.upper(), company=val["name"], price=val["price"])
        db.execute("INSERT INTO history (user_id, symbol, shares, price) VALUES(:user_id, :symbol, :shares, :price)", user_id=session["user_id"], symbol=symbol.upper(), shares=shares, price=val["price"])

        return redirect("/")


@app.route("/history")
@login_required
def history():
    """Show history of transactions"""

    history=db.execute("SELECT symbol, shares, price, Transacted FROM history WHERE user_id=:id ORDER BY Transacted", id=session["user_id"])
    return render_template("history.html", history=history)
    #return apology("TODO")


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():
    # if the request method is GET
    if request.method == 'GET':
        return render_template("quote.html")
    else:
        # lookup symbol
        val = lookup(request.form.get("symbol"))
        if val == None:
            return apology("symbol not found", 403)
        return render_template("quoted.html", price=val["price"], stock=val["symbol"], company= val["name"])


@app.route("/register", methods=["GET", "POST"])
def register():

    # if the request method is GET
    if request.method == 'GET':
        return render_template("register.html")
    else:
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        # if the username field is blank
        if not username:
            return apology("enter username", 403)

        # if the password field is blank
        if not password:
            return apology("enter password", 403)

        # if the confirmation field is blank
        if not confirmation:
            return apology("enter password confirmation", 403)

        #if the password is not equal to the confirmation
        if not password == confirmation:
            return apology("passwords not the same", 403)

        # checks if username already exists
        usernames=db.execute("SELECT username FROM users")
        for u in usernames:
            if username.lower() == u["username"]:
                return apology("enter a different username", 403)

        # hashes the password
        hashedpass = generate_password_hash(password)

        # insert user into users table
        db.execute("INSERT INTO users (username, hash) VALUES (:username, :password)", username=username, password=hashedpass)
        return redirect("/login")


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """Sell shares of stock"""
    if request.method == 'GET':
        symbols=db.execute("SELECT symbol FROM buy WHERE user_id=:id GROUP BY symbol", id=session["user_id"])
        return render_template("sell.html", symbols=symbols)
    else:
        share=request.form.get("shares")
        symbol=request.form.get("symbol")
        # if symbol name field is blank
        if not symbol:
            return apology("must select symbol", 403)

        # if share field is blank
        if not share:
            return apology("enter share count", 403)

        shares=int(share)

        if shares < 1:
            return apology("share count cannot be less than 1!", 403)

        # checks for the total number of shares of a symbol owned by the user
        s=db.execute("SELECT SUM(shares) AS shares from buy WHERE user_id=:id AND symbol=:symbol", id=session["user_id"], symbol=symbol)
        sh=s[0]["shares"]

        # check if user is not selling more than they own
        if shares > sh:
            return apology("oops! balance not sufficient")

        # get the current balance
        b=db.execute("SELECT cash FROM users WHERE id=:id", id=session["user_id"])
        cash=b[0]["cash"]

        # multiply shares by symbol latest price to get amount
        s=lookup(symbol)
        sellamount = shares * s["price"]

        # multiply price at buy by shares
        p=db.execute("SELECT price FROM buy WHERE user_id=:id AND symbol=:symbol", id=session["user_id"], symbol=symbol)
        pm = p[0]["price"]
        buyamount = pm * shares

        profitOrLoss = sellamount - buyamount

        # adding the profit or loss to the user's cash
        newcash = cash + profitOrLoss
        db.execute("UPDATE users SET cash=:cash WHERE id=:id", cash=newcash, id=session["user_id"])

        # selecting the count of shares from buy
        c= db.execute("SELECT shares FROM buy WHERE user_id=:id AND symbol=:symbol", id=session["user_id"], symbol=symbol)
        cs=c[0]["shares"]

        newshare = cs - shares
        #subtracting shares count from buy table
        db.execute("UPDATE buy SET shares=:shares WHERE user_id=:id AND symbol=:symbol", shares=newshare, id=session["user_id"], symbol=symbol)

        #insert into the history table
        db.execute("INSERT INTO history (user_id, symbol, shares, price) VALUES(:user_id, :symbol, :shares, :price)", user_id=session["user_id"], symbol=symbol.upper(), shares= -shares, price=s["price"])

        # if shares number is 0, delete it from table
        s=db.execute("SELECT SUM(shares) AS shares from buy WHERE user_id=:id AND symbol=:symbol", id=session["user_id"], symbol=symbol)
        sa=s[0]["shares"]
        if sa == 0:
            db.execute("DELETE FROM buy WHERE symbol=:symbol AND user_id=:id",symbol=symbol, id=session["user_id"])

        return redirect("/")

@app.route("/changepass", methods=["GET", "POST"])
def changepass():
    if request.method == 'GET':
        return render_template("changepass.html")
    else:
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        # if the username field is blank
        if not username:
            return apology("enter username", 403)

        # if the password field is blank
        if not password:
            return apology("enter password", 403)

        # if the confirmation field is blank
        if not confirmation:
            return apology("enter password confirmation", 403)

        #if the password is not equal to the confirmation
        if not password == confirmation:
            return apology("passwords not the same", 403)

        # hashes the password
        hashedpass = generate_password_hash(password)

        # insert user into users table
        db.execute("UPDATE users SET hash=:hash WHERE username=:username", hash=hashedpass, username=username)
        return redirect("/login")

@app.route("/addcash", methods=["GET", "POST"])
@login_required
def addcash():
    if request.method == 'GET':
        return render_template("addcash.html")
    else:
        deposit=request.form.get("deposit")

        # if blank
        if not deposit:
            return apology("enter deposit amount")

        bal=db.execute("SELECT cash FROM users WHERE id=:id", id=session["user_id"])
        balance = int(bal[0]["cash"])

        # new deposit amount
        newbal = int(deposit) + balance

        # updating table with new balance
        db.execute("UPDATE users SET cash=:cash WHERE id=:id", cash=newbal, id=session["user_id"])

        return redirect("/")

def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)
