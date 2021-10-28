import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage";
import firebase from "../__mocks__/firebase.js";
import Router from "../app/Router";

import { fireEvent } from "@testing-library/dom";


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
            test("Then one file should be uploaded without error", () => {
                // define the window object localStorage
                Object.defineProperty(window, 'localStorage', { value: localStorageMock });
                // define the user's object property
                const user = JSON.stringify({
                    type: 'Employee',
                    email: "azerty@email.com",
                });
                // set localStorage user's type as Employee with email
                window.localStorage.setItem('user', user);
                // define the window object location to the employee's new bill
                Object.defineProperty(window, 'location', {
                    value: {
                        pathname: '/',
                        hash: '#employee/bill/new',
                    },
                });
                // needed for the router object
                document.body.innerHTML = `<div id="root"></div>`;
                // call the router to route to #employee/bill/new
                Router();

                const file = new File(['image.jpeg'],
                    'image.jpeg', { type: 'image/jpeg' });
                const changeFile = fireEvent.change(screen.getByTestId("file"), { target: { files: [file] } });

                const input = screen.getByTestId("file")
                expect(input.files[0]).toStrictEqual(file)
                expect(input.files).toHaveLength(1)
                expect(input.files[0].name).toBe('image.jpeg');
                expect(changeFile).toBeTruthy();
                expect(input.classList.contains('is-invalid')).toBe(false)
            })
        })
        describe("When I upload something other than an image in file input", () => {
            test("Then one file should be uploaded with an error", () => {
                // define the window object localStorage
                Object.defineProperty(window, 'localStorage', { value: localStorageMock });
                // define the user's object property
                const user = JSON.stringify({
                    type: 'Employee',
                    email: "azerty@email.com",
                });
                // set localStorage user's type as Employee with email
                window.localStorage.setItem('user', user);
                // define the window object location to the employee's new bill
                Object.defineProperty(window, 'location', {
                    value: {
                        pathname: '/',
                        hash: '#employee/bill/new',
                    },
                });
                // needed for the router object
                document.body.innerHTML = `<div id="root"></div>`;
                // call the router to route to #employee/bill/new
                Router();

                const file = new File(['document.pdf'],
                    'document.pdf', { type: 'application/pdf' });
                const changeFile = fireEvent.change(screen.getByTestId("file"), { target: { files: [file] } });

                const input = screen.getByTestId("file")
                expect(input.files[0]).toStrictEqual(file)
                expect(input.files).toHaveLength(1)
                expect(input.files[0].name).toBe('document.pdf');
                expect(changeFile).toBeTruthy();
                expect(input.classList.contains('is-invalid')).toBe(true)
            })
        })
        describe("When I submit the form completed", () => {
            test("Then the bill is created", async() => {

                // Track calls to the post method
                const postBillTracked = jest.spyOn(firebase, "post")

                // define the window object localStorage
                Object.defineProperty(window, 'localStorage', { value: localStorageMock });
                // define the user's object property
                const user = JSON.stringify({
                    type: 'Employee',
                    email: "azerty@email.com",
                });
                // set localStorage user's type as Employee with email
                window.localStorage.setItem('user', user);
                // define the window object location to the employee's new bill
                Object.defineProperty(window, 'location', {
                    value: {
                        pathname: '/',
                        hash: '#employee/bill/new',
                    },
                });
                // needed for the router object
                document.body.innerHTML = `<div id="root"></div>`;
                // call the router to route to #employee/bill/new
                Router();





                let fileString = '../img/0.jpg';
                const blob = Promise.resolve(fileString).then(res => {
                    return res.blob();
                });

                const validBill = {
                    type: "Equipement et matériel",
                    name: "Clavier-test",
                    date: "2021-10-20",
                    amount: 10,
                    vat: 10,
                    pct: 10,
                    commentary: "Test",
                    fileUrl: fileString,
                    fileName: "0.jpg",
                    email: "azerty@email.com",
                    status: "pending"
                };

                const file = new File([blob], '0.jpg');

                // Upload filename and fileurl
                // const file = new File(['logo.png'],
                //     'logo.png', { type: 'image/png' });

                // Get the form
                const form = screen.getByTestId("form-new-bill");

                const changeFile = fireEvent.change(screen.getByTestId("file"), { target: { files: [file] } });
                // Load the values in fields
                screen.getByTestId("expense-type").value = validBill.type;
                screen.getByTestId("expense-name").value = validBill.name;
                screen.getByTestId("datepicker").value = validBill.date;
                screen.getByTestId("amount").value = validBill.amount;
                screen.getByTestId("vat").value = validBill.vat;
                screen.getByTestId("pct").value = validBill.pct;
                screen.getByTestId("commentary").value = validBill.commentary;



                // Mock the handleSubmit object
                // const onSubmit = jest.fn(() => {
                //     form.handleSubmit
                // });

                // Fire click event                
                userEvent.click(screen.getByRole("button"))

                // expect(onSubmit).toHaveBeenCalledTimes(1);
                expect(changeFile).toBeTruthy();
                expect(postBillTracked).toHaveBeenCalledWith({
                    validBill
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