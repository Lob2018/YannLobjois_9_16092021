import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
    constructor({ document, onNavigate, firestore, localStorage }) {
        this.document = document
        this.onNavigate = onNavigate
        this.firestore = firestore

        const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
        formNewBill.addEventListener("submit", this.handleSubmit)
        const file = this.document.querySelector(`input[data-testid="file"]`)
        file.addEventListener("change", this.handleChangeFile)
        this.fileUrl = null
        this.fileName = null
        new Logout({ document, localStorage, onNavigate })
    }
    handleChangeFile = e => {
        //file = ;
        const filePath = e.target.files[0].name.split(/\\/g)
        this.fileName = filePath[filePath.length - 1]

        const imageRegex = /\.(jpe?g|png)$/;

        const inputFileElement = this.document.querySelector(`input[data-testid="file"]`);

        if (imageRegex.test(this.fileName)) {
            inputFileElement.classList.remove('is-invalid');

        } else {
            inputFileElement.classList.add('is-invalid');
            inputFileElement.value = null;
        }
    }

    handleSubmit = e => {
        e.preventDefault()
        this.firestore.storage
            .ref(`justificatifs/${this.fileName}`)
            .put(this.document.querySelector(`input[data-testid="file"]`).files[0])
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then(url => {
                this.fileUrl = url
            }).then(() => {
                console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
                const email = JSON.parse(localStorage.getItem("user")).email
                const bill = {
                    email,
                    type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
                    name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
                    amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
                    date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
                    vat: parseInt(e.target.querySelector(`input[data-testid="vat"]`).value),
                    pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
                    commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
                    fileUrl: this.fileUrl,
                    fileName: this.fileName,
                    status: 'pending'
                }
                this.createBill(bill)
                this.onNavigate(ROUTES_PATH['Bills'])
            })
    }

    // not need to cover this function by tests
    /* istanbul ignore next */
    createBill = (bill) => {
        if (this.firestore) {
            this.firestore
                .bills()
                .add(bill)
                .then(() => {
                    this.onNavigate(ROUTES_PATH['Bills'])
                })
                .catch(error => error)
        }
    }
}