import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage";
import firebase from "../__mocks__/firebase.js";
import firestore from "../app/Firestore.js";
import { fireEvent } from "@testing-library/dom"


import BillsUI from "../views/BillsUI.js";


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
            test("Then one file should be uploaded", () => {
                const html = NewBillUI()
                document.body.innerHTML = html

                // needed for the NewBill object
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname })
                };
                // Create a NewBill object
                const newBillContainer = new NewBill({
                    document,
                    onNavigate,
                    firestore: null,
                    localStorage: null,
                });

                const changeFile = jest.fn(newBillContainer.handleChangeFile);
                const input = screen.getByTestId("file")
                input.addEventListener("change", changeFile);

                const file = new File(['image.jpeg'],
                    'image.jpeg', { type: 'image/jpeg' });

                userEvent.upload(input, file);

                expect(input.files[0]).toStrictEqual(file)
                expect(input.files).toHaveLength(1)
                expect(input.files[0].name).toBe('image.jpeg');
                expect(changeFile).toHaveBeenCalled();
            })
        })
        describe("When I submit the form completed", () => {
            test("Then the bill is created", async() => {
                const html = NewBillUI()
                document.body.innerHTML = html

                // define the window object localStorage
                Object.defineProperty(window, 'localStorage', { value: localStorageMock });

                window.localStorage.setItem(
                    "user",
                    JSON.stringify({
                        type: "Employee",
                        email: "azerty@email.com",
                    })
                );

                const newBill = new NewBill({
                    document,
                    onNavigate: () => {},
                    firestore,
                    localStorage: window.localStorage,
                });

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
                };

                screen.getByTestId("expense-type").value = validBill.type;
                screen.getByTestId("expense-name").value = validBill.name;
                screen.getByTestId("datepicker").value = validBill.date;
                screen.getByTestId("amount").value = validBill.amount;
                screen.getByTestId("vat").value = validBill.vat;
                screen.getByTestId("pct").value = validBill.pct;
                screen.getByTestId("commentary").value = validBill.commentary;
                newBill.fileName = validBill.fileName;
                newBill.fileUrl = validBill.fileUrl;

                newBill.createBill = jest.fn();

                const onSubmit = jest.fn(() => {
                    newBill.handleSubmit
                });

                const form = screen.getByTestId("form-new-bill");
                form.addEventListener("submit", onSubmit);

                // Fire click event
                fireEvent.click(screen.getByRole("button"))

                expect(onSubmit).toHaveBeenCalled();
                expect(newBill.createBill).toHaveBeenCalledWith({
                    ...validBill,
                    status: "pending",
                });
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
                // test("POST bill from an API and fails with 404 message error", async() => {
                //     firebase.post.mockImplementationOnce(() =>
                //         Promise.reject(new Error("Erreur 404"))
                //     )
                //     const html = BillsUI({ error: "Erreur 404" })
                //     document.body.innerHTML = html
                //     const message = await screen.getByText(/Erreur 404/)
                //     expect(message).toBeTruthy()
                // })
                // test("POST messages from an API and fails with 500 message error", async() => {
                //     firebase.post.mockImplementationOnce(() =>
                //         Promise.reject(new Error("Erreur 500"))
                //     )
                //     const html = BillsUI({ error: "Erreur 500" })
                //     document.body.innerHTML = html
                //     const message = await screen.getByText(/Erreur 500/)
                //     expect(message).toBeTruthy()
                // })
        })
    })
})