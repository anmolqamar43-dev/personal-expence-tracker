// =========================================================
// FIREBASE IMPORTS
// =========================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const firebaseConfig = {

    apiKey: "AIzaSyCy-TvDP6SqNVrPw_V_ePBju6IAlPHXZw4",

    authDomain:
        "personal-expense-tracker-13e44.firebaseapp.com",

    projectId:
        "personal-expense-tracker-13e44",

    storageBucket:
        "personal-expense-tracker-13e44.firebasestorage.app",

    messagingSenderId:
        "1079293647603",

    appId:
        "1:1079293647603:web:58b03afae4ae0828bcb586",

    measurementId:
        "G-X1CWNRCYZB"
};


// =========================================================
// INITIALIZE FIREBASE
// =========================================================

const firebaseApp =
    initializeApp(firebaseConfig);


const db =
    getFirestore(firebaseApp);


// =========================================================
// HTML ELEMENTS
// =========================================================

const titleInput =
    document.getElementById("expenseTitle");


const amountInput =
    document.getElementById("amount");


const categoryInput =
    document.getElementById("category");


const dateInput =
    document.getElementById("date");


const addExpenseBtn =
    document.getElementById("addExpenseBtn");


const analyzeBtn =
    document.getElementById("analyzeBtn");


const aiResult =
    document.getElementById("aiResult");


const expenseTableBody =
    document.getElementById("expenseTableBody");


const totalExpenses =
    document.getElementById("totalExpenses");


const totalAmount =
    document.getElementById("totalAmount");


// =========================================================
// ADD EXPENSE
// =========================================================

addExpenseBtn.addEventListener(
    "click",
    async function () {

        const title =
            titleInput.value.trim();


        const amount =
            Number(amountInput.value);


        const category =
            categoryInput.value;


        const date =
            dateInput.value;


        // -------------------------
        // VALIDATION
        // -------------------------

        if (!title) {

            alert("Please enter expense title.");

            titleInput.focus();

            return;
        }


        if (!amount || amount <= 0) {

            alert("Please enter a valid amount.");

            amountInput.focus();

            return;
        }


        if (!category) {

            alert("Please select a category.");

            categoryInput.focus();

            return;
        }


        if (!date) {

            alert("Please select a date.");

            dateInput.focus();

            return;
        }


        // -------------------------
        // SAVE TO FIREBASE
        // -------------------------

        try {

            addExpenseBtn.disabled = true;

            addExpenseBtn.textContent =
                "Adding...";


            await addDoc(
                collection(db, "expenses"),
                {
                    title: title,
                    amount: amount,
                    category: category,
                    date: date
                }
            );


            alert(
                "Expense added successfully!"
            );


            // Clear form

            clearForm();


            // Reload expenses

            await loadExpenses();


        } catch (error) {

            console.error(
                "Error adding expense:",
                error
            );


            alert(
                "Firebase Error: " +
                error.message
            );


        } finally {

            addExpenseBtn.disabled = false;

            addExpenseBtn.textContent =
                "Add Expense";
        }

    }
);


// =========================================================
// LOAD EXPENSES
// =========================================================

async function loadExpenses() {

    try {

        const querySnapshot =
            await getDocs(
                collection(db, "expenses")
            );


        // Clear existing rows

        expenseTableBody.innerHTML = "";


        let total = 0;

        let count = 0;


        // -------------------------
        // NO EXPENSES
        // -------------------------

        if (querySnapshot.empty) {

            const row =
                document.createElement("tr");


            const cell =
                document.createElement("td");


            cell.colSpan = 5;

            cell.className =
                "empty-message";

            cell.textContent =
                "No expenses added yet.";


            row.appendChild(cell);

            expenseTableBody.appendChild(row);


            totalExpenses.textContent = "0";

            totalAmount.textContent = "0";


            return;
        }


        // -------------------------
        // DISPLAY EXPENSES
        // -------------------------

        querySnapshot.forEach(
            function (expenseDoc) {

                const expense =
                    expenseDoc.data();


                const id =
                    expenseDoc.id;


                count++;


                total +=
                    Number(expense.amount) || 0;


                // Create row

                const row =
                    document.createElement("tr");


                // Title

                const titleCell =
                    document.createElement("td");

                titleCell.textContent =
                    expense.title || "-";


                // Amount

                const amountCell =
                    document.createElement("td");

                amountCell.textContent =
                    `Rs. ${expense.amount || 0}`;


                // Category

                const categoryCell =
                    document.createElement("td");

                categoryCell.textContent =
                    expense.category || "-";


                // Date

                const dateCell =
                    document.createElement("td");

                dateCell.textContent =
                    expense.date || "-";


                // Action

                const actionCell =
                    document.createElement("td");


                const deleteButton =
                    document.createElement("button");


                deleteButton.textContent =
                    "Delete";


                deleteButton.className =
                    "delete-btn";


                deleteButton.addEventListener(
                    "click",
                    function () {

                        deleteExpense(id);

                    }
                );


                actionCell.appendChild(
                    deleteButton
                );


                // Add cells

                row.appendChild(titleCell);

                row.appendChild(amountCell);

                row.appendChild(categoryCell);

                row.appendChild(dateCell);

                row.appendChild(actionCell);


                // Add row

                expenseTableBody.appendChild(row);

            }
        );


        // -------------------------
        // UPDATE SUMMARY
        // -------------------------

        totalExpenses.textContent =
            count;


        totalAmount.textContent =
            total;


    } catch (error) {

        console.error(
            "Error loading expenses:",
            error
        );


        alert(
            "Failed to load expenses: " +
            error.message
        );

    }
}


// =========================================================
// DELETE EXPENSE
// =========================================================

async function deleteExpense(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmDelete) {

        return;
    }


    try {

        await deleteDoc(
            doc(db, "expenses", id)
        );


        alert(
            "Expense deleted successfully!"
        );


        await loadExpenses();


    } catch (error) {

        console.error(
            "Error deleting expense:",
            error
        );


        alert(
            "Failed to delete expense: " +
            error.message
        );

    }
}


// =========================================================
// GROQ AI EXPENSE ANALYSIS
// =========================================================

analyzeBtn.addEventListener(
    "click",
    async function () {

        try {

            // -------------------------
            // BUTTON STATE
            // -------------------------

            analyzeBtn.disabled = true;

            analyzeBtn.textContent =
                "🤖 Analyzing...";


            aiResult.classList.remove(
                "hidden"
            );


            aiResult.textContent =
                "AI is analyzing your expenses...";


            // -------------------------
            // GET EXPENSES
            // -------------------------

            const querySnapshot =
                await getDocs(
                    collection(db, "expenses")
                );


            const expenses = [];


            querySnapshot.forEach(
                function (expenseDoc) {

                    const expense =
                        expenseDoc.data();


                    expenses.push({

                        title:
                            expense.title,

                        amount:
                            Number(expense.amount),

                        category:
                            expense.category,

                        date:
                            expense.date

                    });

                }
            );


            // -------------------------
            // CHECK EMPTY DATA
            // -------------------------

            if (expenses.length === 0) {

                aiResult.textContent =
                    "No expenses available to analyze.";

                return;
            }


            // -------------------------
            // SEND TO FASTAPI
            // -------------------------

            const response =
                await fetch(
                    "http://127.0.0.1:8000/analyze-expenses",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            expenses: expenses
                        })
                    }
                );


            // -------------------------
            // CHECK RESPONSE
            // -------------------------

            if (!response.ok) {

                throw new Error(
                    `Server error: ${response.status}`
                );
            }


            const data =
                await response.json();


            // -------------------------
            // DISPLAY AI RESPONSE
            // -------------------------

            if (data.analysis) {

                aiResult.textContent =
                    data.analysis;

            } else if (data.error) {

                aiResult.textContent =
                    "Groq Error: " +
                    data.error;

            } else {

                aiResult.textContent =
                    "No AI analysis was returned.";

            }


        } catch (error) {

            console.error(
                "AI Analysis Error:",
                error
            );


            aiResult.classList.remove(
                "hidden"
            );


            aiResult.textContent =
                "Unable to connect to AI.\n\n" +
                "Please make sure your FastAPI server is running.\n\n" +
                "Error: " +
                error.message;


        } finally {

            // -------------------------
            // RESET BUTTON
            // -------------------------

            analyzeBtn.disabled = false;

            analyzeBtn.textContent =
                "🤖 Analyze My Expenses";

        }

    }
);


// =========================================================
// CLEAR FORM
// =========================================================

function clearForm() {

    titleInput.value = "";

    amountInput.value = "";

    categoryInput.value = "";

    dateInput.value = "";

}


// =========================================================
// LOAD DATA WHEN PAGE OPENS
// =========================================================

loadExpenses();