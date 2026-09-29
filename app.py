import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from groq import Groq


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# =========================================================
# GROQ CLIENT
# =========================================================

client = Groq(
    api_key=GROQ_API_KEY
)


# =========================================================
# CREATE FASTAPI APP
# =========================================================

app = FastAPI(
    title="Personal Expense Tracker",
    description="Personal Expense Tracker with Groq AI",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# HOME ROUTE
# =========================================================

@app.get("/")
def home():

    return FileResponse("index.html")


# =========================================================
# CSS FILE
# =========================================================

@app.get("/style.css")
def get_css():

    return FileResponse("style.css")


# =========================================================
# JAVASCRIPT FILE
# =========================================================

@app.get("/app.js")
def get_js():

    return FileResponse("app.js")


# =========================================================
# GROQ EXPENSE ANALYSIS
# =========================================================

@app.post("/analyze-expenses")
def analyze_expenses(data: dict):

    expenses = data.get("expenses", [])


    # -----------------------------------------------------
    # CHECK EXPENSES
    # -----------------------------------------------------

    if not expenses:

        return {
            "analysis": "No expenses available to analyze."
        }


    # -----------------------------------------------------
    # CONVERT EXPENSES TO TEXT
    # -----------------------------------------------------

    expense_text = ""


    for expense in expenses:

        expense_text += (
            f"Title: {expense.get('title')}, "
            f"Amount: Rs. {expense.get('amount')}, "
            f"Category: {expense.get('category')}, "
            f"Date: {expense.get('date')}\n"
        )


    # -----------------------------------------------------
    # GROQ PROMPT
    # -----------------------------------------------------

    prompt = f"""
You are a personal expense analysis assistant.

Analyze the following personal expenses:

{expense_text}

Provide a simple and useful analysis.

Include:

1. Total spending
2. Number of expenses
3. Highest spending category
4. General spending pattern
5. Two practical suggestions for managing expenses

Use simple English.
Keep the answer clear and easy to understand.
"""


    # -----------------------------------------------------
    # CALL GROQ
    # -----------------------------------------------------

    try:

        response = client.chat.completions.create(

            model="openai/gpt-oss-20b",

            messages=[

                {
                    "role": "system",
                    "content":
                        "You are a helpful personal expense analysis assistant."
                },

                {
                    "role": "user",
                    "content": prompt
                }

            ]
        )


        analysis = (
            response
            .choices[0]
            .message
            .content
        )


        return {
            "analysis": analysis
        }


    except Exception as error:

        print(
            "Groq Error:",
            error
        )


        return {
            "error": str(error)
        }