import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"

import firestore from "../app/Firestore";
import { localStorageMock } from "../__mocks__/localStorage.js"
import Router from "../app/Router";

import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import { ROUTES } from "../constants/routes.js";



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
            // mock the Firestore's class
            jest.mock("../app/Firestore");
            // set the bills from firebase local values
            firestore.bills = () => ({
                get: jest.fn().mockResolvedValue(),
            });
            // define the window object localStorage
            Object.defineProperty(window, 'localStorage', { value: localStorageMock });
            // define the user's object properties
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

                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname })
                }

                const billsContainer = new Bills({
                    document,
                    onNavigate,
                    localStorage: null,
                    firestore: null,
                });

                const html = BillsUI({ data: bills });
                document.body.innerHTML = html;

                const clickNewBill = jest.fn((e) => billsContainer.handleClickNewBill(e));

                const newBillButton = screen.getByTestId("btn-new-bill");
                newBillButton.addEventListener("click", clickNewBill);
                userEvent.click(newBillButton);

                expect(clickNewBill).toHaveBeenCalledTimes(1);
            });
        });

        // #2 composant container/Bills
        describe("When I click on first eye icon", () => {
            test("Then modal should open", () => {
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

                $.fn.modal = jest.fn();
                const firstEyeIcon = screen.getAllByTestId("icon-eye")[0];
                const clickIconEye = jest.fn(
                    billsContainer.handleClickIconEye(firstEyeIcon)
                );
                firstEyeIcon.addEventListener("click", clickIconEye);
                userEvent.click(firstEyeIcon);

                expect($.fn.modal).toHaveBeenCalled;
                expect(clickIconEye).toHaveBeenCalledTimes(1);
            });
        });
    })
})