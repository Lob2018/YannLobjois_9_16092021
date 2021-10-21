import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"

import firestore from "../app/Firestore";
import { localStorageMock } from "../__mocks__/localStorage.js"
import Router from "../app/Router";

import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import { ROUTES } from "../constants/routes.js";
import { fireEvent } from "@testing-library/dom"

import firebase from "../__mocks__/firebase"





describe("Given I am connected as an employee", () => {
    // #1 composant views/BillsUI
    describe("When I am on Bills page and it's loading", () => {
        test("Then Loading page should be displayed", () => {
            const html = BillsUI({ data: [], loading: true });
            document.body.innerHTML = html;
            const isLoading = screen.getAllByText("Loading...");
            expect(isLoading).toBeTruthy();
        })
    })
    describe("When I am on Bills page with an error", () => {
        test("Then Error page should be displayed", () => {
            const html = BillsUI({ data: [], error: true });
            document.body.innerHTML = html;
            const hasError = screen.getAllByText("Erreur");
            expect(hasError).toBeTruthy();
        })
    })
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", () => {
            // Jest's simulation module for the Firestore's class
            // mock the Firestore's class
            jest.mock("../app/Firestore");
            // set the bills from firebase local values
            firestore.bills = () => ({
                get: jest.fn().mockResolvedValue()
            });
            // define the window object localStorage
            Object.defineProperty(window, 'localStorage', { value: localStorageMock });
            // define the user's object property
            const user = JSON.stringify({
                type: 'Employee'
            });
            // set localStorage user's type as Employee
            window.localStorage.setItem('user', user);
            // define the window object location to the employee's bills
            Object.defineProperty(window, 'location', {
                value: {
                    pathname: '/',
                    hash: '#employee/bills',
                },
            });
            // needed for the router object
            document.body.innerHTML = `<div id="root"></div>`;
            // call the router to route to #employee/bills
            Router();

            expect(
                screen.getByTestId("icon-window").classList.contains("active-icon")
            ).toBeTruthy();
            expect(
                screen.getByTestId("icon-mail").classList.contains("active-icon")
            ).not.toBeTruthy();
        });

        // # 0 Bills 
        // Jest run under Node.js without the full internationalization support, 1 Jan. 01 -> 1 M01. 01
        test("Then bills should be ordered from earliest to latest", () => {
            const html = BillsUI({ data: bills })
            document.body.innerHTML = html
            const dates = screen.getAllByText(/^([1-9]|[12][0-9]|3[01])[ ]\w{3}[.][ ]\d{2}$/i).map(a => a.innerHTML);
            //  1 M01. 01 (JJ MMM. AA) -> 01 M01. 1 (AA MMM. JJ)
            for (let i = 0; i < dates.length; i++) {
                let dateUpdated = dates[i].split(' ');
                dates[i] = `${dateUpdated[2]} ${dateUpdated[1]} ${dateUpdated[0]}`;
            }
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })

        // #2 composant container/Bills
        describe("When I click on new bill button", () => {
            test("Then I should be redirected to New Bill page", () => {
                // needed for the Bills object
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname })
                };
                // Create a Bills object
                const billsContainer = new Bills({
                    document,
                    onNavigate,
                    localStorage: null,
                    firestore: null,
                });
                // Call the bills UI and pass the data
                const html = BillsUI({ data: bills });
                document.body.innerHTML = html;
                // Mock the handleClickNewBill's method
                const handleClickNewBill = jest.fn((e) => billsContainer.handleClickNewBill(e));
                // Get the new bill's button
                const newBillButton = screen.getByTestId("btn-new-bill");
                // Add click event
                newBillButton.addEventListener("click", handleClickNewBill);
                // Fire click event
                fireEvent.click(newBillButton)

                expect(handleClickNewBill).toHaveBeenCalledTimes(1);
            });
        });

        // #2 composant container/Bills
        describe("When I click on first eye icon", () => {
            test("Then modal should open", () => {

                // Load the data
                const html = BillsUI({ data: bills });
                document.body.innerHTML = html;

                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname });
                };
                const billsContainer = new Bills({
                    document,
                    onNavigate,
                    localStorage: null,
                    firestore: null,
                });

                // Mock the Bootstrap jQuery modal prototype
                $.fn.modal = jest.fn();

                // Mock the handleClickIconEye method
                const handleClickIconEye = jest.fn(() => {
                    billsContainer.handleClickIconEye
                });

                // Get the first bill icon-eye button
                const firstEyeIcon = screen.getAllByTestId("icon-eye")[0];
                // Add click event
                firstEyeIcon.addEventListener("click", handleClickIconEye);
                // Fire click event
                fireEvent.click(firstEyeIcon)

                expect(handleClickIconEye).toHaveBeenCalledTimes(1);
                expect($.fn.modal).toHaveBeenCalledTimes(1);
            });
        });

        // #2 composant container/Bills GET Bills
        describe("When I navigate to bills page", () => {
            test("fetches bills from mock API GET", async() => {
                const getSpy = jest.spyOn(firebase, "get")
                const bills = await firebase.get()
                expect(getSpy).toHaveBeenCalledTimes(1)
                expect(bills.data.length).toBe(4)
            })
            test("fetches bills from an API and fails with 404 message error", async() => {
                firebase.get.mockImplementationOnce(() =>
                    Promise.reject(new Error("Erreur 404"))
                )
                const html = BillsUI({ error: "Erreur 404" })
                document.body.innerHTML = html
                const message = await screen.getByText(/Erreur 404/)
                expect(message).toBeTruthy()
            })
            test("fetches messages from an API and fails with 500 message error", async() => {
                firebase.get.mockImplementationOnce(() =>
                    Promise.reject(new Error("Erreur 500"))
                )
                const html = BillsUI({ error: "Erreur 500" })
                document.body.innerHTML = html
                const message = await screen.getByText(/Erreur 500/)
                expect(message).toBeTruthy()
            })
        })
    })
})