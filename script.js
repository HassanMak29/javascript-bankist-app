/////////////////////////////////////////////////
// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  zakatRate: 2.5, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  zakatRate: 2.5, // %
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  zakatRate: 2.5, // %
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  zakatRate: 2.5, // %
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

/////////////////////////////////////////////////
// Elements
const message = document.querySelector(".welcome-message");
const currentDate = document.querySelector(".balance__date");
const balance = document.querySelector(".balance__amount");
const summaryIn = document.querySelector(".summary__amount--in");
const summaryOut = document.querySelector(".summary__amount--out");
const summaryZakat = document.querySelector(".summary__amount--zakat");
const logoutTimer = document.querySelector(".logout-time");
const movementsList = document.querySelector(".movements");
const app = document.querySelector(".main");

const inputUsername = document.querySelector(".username");
const inputPin = document.querySelector(".pin");
const inputTransUser = document.querySelector(".input__transfer-user");
const inputTransAmount = document.querySelector(".input__transfer-amount");
const inputLoanAmount = document.querySelector(".input__request-amount");
const inputCloseUser = document.querySelector(".input__close-user");
const inputClosePin = document.querySelector(".input__close-pin");

const btnLogin = document.querySelector(".login-btn");
const btnTransfer = document.querySelector(".transfer-btn");
const btnLoan = document.querySelector(".loan-btn");
const btnClose = document.querySelector(".close-btn");
const btnSort = document.querySelector(".btn-sort");

/////////////////////////////////////////////////
// Functions
let currentAccount, timer;

function createUserNames() {
  accounts.forEach(
    (acc) =>
      (acc.username = acc.owner
        .split(" ")
        .map((name) => name[0].toLowerCase())
        .join(""))
  );
}
createUserNames();

function getUser(input) {
  return accounts.find((acc) => acc.username === input);
}

// getUser(inputUsername.value);

const updateUI = (account, sort = false) => {
  message.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;
  currentDate.textContent = `As of ${new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(Date.now()))}`;

  balance.textContent = `${currentAccount.movements.reduce(
    (sum, cur) => sum + cur,
    0
  )} €`;
  summaryIn.textContent = `${currentAccount.movements
    .filter((mov) => mov >= 0)
    .reduce((sum, cur) => sum + cur, 0)} €`;

  summaryOut.textContent = `${currentAccount.movements
    .filter((mov) => mov < 0)
    .reduce((sum, cur) => sum + cur, 0)} €`;

  summaryZakat.textContent = `${currentAccount.movements
    .filter((mov) => mov > 0)
    .reduce((sum, cur) => sum + (currentAccount.zakatRate / 100) * cur, 0)} €`;

  logoutTimer.textContent = "02:00";

  const movs = sort
    ? currentAccount.movements.slice().sort((a, b) => a - b)
    : currentAccount.movements;

  movementsList.innerHTML = "";
  movs.forEach((mov, i) => {
    type = mov > 0 ? "deposit" : "withdrawal";
    html = `
    <div class="movement movement-2">
        <div class="movement__type movement__type--${type}">${
      i + 1
    } ${type}</div>
        <p class="movement__date movement__date--${i + 1}">01/08/2020</p>
        <p class="movement__amount movement__amount--${i + 1}">${mov} €</p>
    </div>
    `;
    movementsList.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayTransfer = () => {
  const receiver = getUser(inputTransUser.value);
  const amount = Number(inputTransAmount.value);
  const currentAccountBalance = currentAccount.movements.reduce(
    (sum, cur) => sum + cur,
    0
  );

  if (
    amount > 0 &&
    receiver &&
    currentAccountBalance > 0 &&
    receiver.username !== currentAccount.username
  ) {
    receiver.movements.push(amount);
    currentAccount.movements.push(-amount);
  }

  inputTransUser.value = inputTransAmount.value = "";
  updateUI(currentAccount);
};

const calcDisplayRequest = () => {
  const amount = Number(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= 0.1 * amount)
  ) {
    currentAccount.movements.push(amount);
  }

  inputLoanAmount.value = "";
  updateUI(currentAccount);
};

const closeAccount = () => {
  if (
    currentAccount.username === inputCloseUser.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const accountIndex = accounts.findIndex(
      (acc) => acc.username === inputCloseUser.value
    );
    accounts.splice(accountIndex, 1);
    inputCloseUser.value = inputClosePin.value = "";
    message.textContent = "Log in to get started";
    app.style.opacity = 0;
  }
};

const startLogoutTimer = (time = 120) => {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    logoutTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      message.textContent = "Log in to get started";
      app.style.opacity = 0;
    }

    time--;
  };

  tick(time);
  const timer = setInterval(tick, 1000);
  return timer;
};

/////////////////////////////////////////////////
// Event Listeners
btnLogin.addEventListener("click", function (e) {
  e.preventDefault();

  currentAccount = getUser(inputUsername.value);
  //   console.log(currentAccount.pin);
  if (currentAccount.pin === Number(inputPin.value)) {
    app.style.opacity = 100;
  }

  inputUsername.value = inputPin.value = "";
  if (timer) clearInterval(timer);
  timer = startLogoutTimer();
  updateUI(currentAccount);
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  clearInterval(timer);
  timer = startLogoutTimer();
  calcDisplayTransfer();
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  clearInterval(timer);
  timer = startLogoutTimer();
  calcDisplayRequest();
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  closeAccount();
});

let sorted = true;
btnSort.addEventListener("click", function () {
  clearInterval(timer);
  timer = startLogoutTimer();
  updateUI(currentAccount, sorted);
  sorted = !sorted;
});

document.querySelector("body").addEventListener("click", function () {
  if (timer) clearInterval(timer);
  timer = startLogoutTimer();
});
