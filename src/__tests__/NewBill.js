import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage";
import firebase from "../__mocks__/firebase.js";


describe("Given I am connected as an employee", () => {

    // #3 composant container/NewBill
    describe("When I am on NewBill Page", () => {
        test("Then the new bill's form should be loaded with its fields", () => {
            const html = NewBillUI()
            document.body.innerHTML = html
            expect(screen.getByTestId("form-new-bill")).toBeTruthy();
            expect(screen.getByTestId("expense-type")).toBeTruthy();
            expect(screen.getByTestId("expense-name")).toBeTruthy();
            expect(screen.getByTestId("datepicker")).toBeTruthy();
            expect(screen.getByTestId("amount")).toBeTruthy();
            expect(screen.getByTestId("vat")).toBeTruthy();
            expect(screen.getByTestId("pct")).toBeTruthy();
            expect(screen.getByTestId("commentary")).toBeTruthy();
            expect(screen.getByTestId("file")).toBeTruthy();
            expect(screen.getByRole("button")).toBeTruthy();
        })
        describe("When I upload an image in file input", () => {
            test("Then one file should be uploaded", async() => {

                document.body.innerHTML = NewBillUI();
                Object.defineProperty(window, 'localStorage', { value: localStorageMock })

                Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Employee',
                    email: "azerty@email.com",
                }))

                const newBill = new NewBill({
                    document,
                    onNavigate: () => {},
                    firestore: null,
                    localStorage: window.localStorage
                })

                const changeFile = jest.fn((e) => newBill.handleChangeFile(e))
                const file = new File(['test.jpg'], 'test.jpg', { type: 'image/jpg' })

                const input = screen.getByTestId("file")
                input.addEventListener("change", changeFile);

                userEvent.upload(input, file)

                expect(changeFile).toHaveBeenCalled();

                expect(input.files[0]).toStrictEqual(file)
                expect(input.files.item(0)).toStrictEqual(file)
                expect(input.files).toHaveLength(1)
            })
        })
        describe("When I submit the form completed", () => {
            test("Then the bill is created", async() => {

                document.body.innerHTML = NewBillUI();
                Object.defineProperty(window, 'localStorage', { value: localStorageMock })

                Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Employee',
                    email: "azerty@email.com",
                }))

                const newBill = new NewBill({
                    document,
                    onNavigate: () => {},
                    firestore: null,
                    localStorage: window.localStorage
                })

                const validBill = {
                    type: "Equipement et matériel",
                    name: "Clavier-test",
                    date: "2021-10-20",
                    amount: 10,
                    vat: 10,
                    pct: 10,
                    commentary: "Test",
                    fileUrl: "../img/0.jpg",
                    fileName: "test.jpg",
                    status: "pending"
                };

                // Load the values in fields
                screen.getByTestId("expense-type").value = validBill.type;
                screen.getByTestId("expense-name").value = validBill.name;
                // ISO 8601
                screen.getByTestId("datepicker").value = validBill.date;
                screen.getByTestId("amount").value = validBill.amount;
                screen.getByTestId("vat").value = validBill.vat;
                screen.getByTestId("pct").value = validBill.pct;
                screen.getByTestId("commentary").value = validBill.commentary;

                newBill.fileName = validBill.fileName
                newBill.fileUrl = validBill.fileUrl;

                newBill.createBill = jest.fn();
                const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

                const form = screen.getByTestId("form-new-bill");
                form.addEventListener("submit", handleSubmit);
                expect(screen.getByText('Envoyer').type).toBe('submit')

                userEvent.click(screen.getByText("Envoyer"))

                expect(handleSubmit).toHaveBeenCalled()
                expect(newBill.createBill).toHaveBeenCalledWith({
                    ...validBill
                })
            })
        })

        // #3 composant container/NewBill POST new bill
        describe("When I submit the bill's form", () => {
            test("POST bill from mock API with success", async() => {
                const postBill = jest.spyOn(firebase, "post")
                const validBill = {
                    type: "Equipement et matériel",
                    name: "Clavier-test",
                    date: "2021-10-20",
                    amount: 10,
                    vat: 10,
                    pct: 10,
                    commentary: "Test",
                    fileUrl: "https://en.wikipedia.org/wiki/File:Chrome-crash.png",
                    fileName: "logo.png",
                    email: "azerty@email.com",
                    status: "pending"
                };
                const bills = await firebase.post(validBill);
                expect(postBill).toBeCalled();
                expect(bills.data.length).toBe(5);
            })
        })
    })
})