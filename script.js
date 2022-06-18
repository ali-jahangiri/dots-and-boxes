const GRID = 4;
const BOX_SIZE = 128;


const appDOMEntry = document.getElementById("appDOMEntry");

class Match {
    constructor() {
        this.playerColor = {
            red : "#f3849c",
            blue : "#8789f8"
        }

        // this.start();

    }

    start() {
        this.swipeTurn()
    }

    swipeTurn() {
        this.turn = this.turn === "blue" ? "red" : "blue";
        container.setAttribute("turn" , this.turn);
    }

    end() {

    }

    reset() {

    }
}

class Playground {
    constructor() {

        this.match = new Match();

        this.store = {
            column : {},
            row : {},
        };

        this.takenFilledBox = [];

        
    }


    createPlaygroundTemplate() {
        

        const playgroundTemplate = `
        <div class="masterContainer">
            <header>
                <div class="headerContainer">
                <div>
                    <p>user 1</p>
                    <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M12,12A6,6,0,1,0,6,6,6.006,6.006,0,0,0,12,12ZM12,2A4,4,0,1,1,8,6,4,4,0,0,1,12,2Z"/><path d="M12,14a9.01,9.01,0,0,0-9,9,1,1,0,0,0,2,0,7,7,0,0,1,14,0,1,1,0,0,0,2,0A9.01,9.01,0,0,0,12,14Z"/></svg>
                    <span></span>
                </div>
                <div>
                    <p>user 2</p>
                    <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M12,12A6,6,0,1,0,6,6,6.006,6.006,0,0,0,12,12ZM12,2A4,4,0,1,1,8,6,4,4,0,0,1,12,2Z"/><path d="M12,14a9.01,9.01,0,0,0-9,9,1,1,0,0,0,2,0,7,7,0,0,1,14,0,1,1,0,0,0,2,0A9.01,9.01,0,0,0,12,14Z"/></svg>
                    <span></span>
                </div>
                </div>
            </header>
            <div id="container">
                <div id="filledBoxesAreas"></div>
            </div>
        </div>
        `;

        appDOMEntry.innerHTML = playgroundTemplate;
        const container = document.getElementById("container");
        const filledBoxesAreas = document.getElementById("filledBoxesAreas");

        container.style.width = `${(GRID) * BOX_SIZE}px`;
        
        for(let i = 0; i < (GRID * GRID); i++) {
            filledBoxesAreas.innerHTML += `
                <div class="filledBoxesAreas-box"></div>
            `
        }


        const rowTemplate = (row , index , isLast) =>  `
        <div class="row">
            <div class="dot"></div>
            <div data-pos=${`${row}-${index}`} data-type="row" class="divider"></div>
            ${isLast ? `<div class="dot"></div>` : ""}
        </div>`;

        const columnTemplate = (column , index) => `<div data-pos=${`${column}-${index}`} data-type="column" class="column"></div>`;

        function createRow(i) {
            const rowContainer = document.createElement("div");
            rowContainer.classList.add(`rowContainer-${i}`);
            for(let index = 0 ; index < GRID; index++) {
                rowContainer.innerHTML += rowTemplate(i , index , index === (GRID - 1));
            }
            container.appendChild(rowContainer);
        }

        function createColumn(i) {
            const columnContainer = document.createElement("div");
            columnContainer.classList.add(`columnContainer-${i}`);

            for(let index = 0 ; index < (GRID + 1); index++) {
                columnContainer.innerHTML += columnTemplate(i , index);
            }
            container.appendChild(columnContainer);
        }

        for(let i= 0; i <= (GRID); i++) {
            createRow(i);
            if(i !== GRID) createColumn(i)
        }

        const columns = document.querySelectorAll(".column");
        const rows = document.querySelectorAll(".row .divider");

        [...columns , ...rows].forEach(el => {
            el.addEventListener("click" , this.selectHandler.bind(this))
        });

        this.match.start();
    }


    selectHandler(e) {
        const targetElement = e.target;

        const { type : selectedType , pos } = targetElement.dataset;
        
        const [mainAxisIndex , crossAxisIndex] = pos.split("-");
        
        const isTakenAlready = this.store[selectedType]?.[mainAxisIndex]?.find(el => +el.index === +crossAxisIndex);

        if(isTakenAlready) this.selectedTakenLineHandler(isTakenAlready.owner)
        else {
            this.store[selectedType] = {
                ...this.store[selectedType],
                [mainAxisIndex] : [...(this.store[selectedType]?.[mainAxisIndex] || []), { index : +crossAxisIndex , owner : this.match.turn }]
            };
            
            targetElement.classList.add(`${this.match.turn}Line`);
    
            this.checkForCompletedAreaSpace();
        }

    }


    selectedTakenLineHandler(lineOwner) {
        console.log(lineOwner , " take the line");
    }

    checkForCompletedAreaSpace() {
        let haveToSwipeTurn = true;

        for (let key in this.store.row) {
            const currentRow = this.store.row[key];

            currentRow.forEach(row => {
                const haveYNextNeighborhood = this.store.row[(+key + 1)]?.find(el => el.index === row.index);

                const baseXCole = this.store.column[key]?.find(el => el.index === row.index);
                const haveXNextNeighborhood = this.store.column[key]?.find(el => el.index === (row.index + 1));

                
                if(haveYNextNeighborhood && baseXCole && haveXNextNeighborhood) {
                    const takenIdentifier = `${key}-${row.index}`;

                    if(!this.takenFilledBox.includes(takenIdentifier)) {
                        
                        this.takenFilledBox = [
                            ...this.takenFilledBox,
                            takenIdentifier
                        ];
    
                        const targetNumber = (Number(key) * GRID) + row.index;
    
                        filledBoxesAreas.children[targetNumber].style.backgroundColor = this.match.playerColor[this.match.turn];

                        haveToSwipeTurn = false;
                    }
                }

            });
        }

        if(haveToSwipeTurn) {
            this.match.swipeTurn();
        }
    }


    fillBoxHandler() {

    }
}

class Session {
    constructor(playground) {
        this.USERNAME_PERSIST_KEY = "userName";
        this.playground = playground;
        const havePersistedUserName = localStorage.getItem(this.USERNAME_PERSIST_KEY);
        this.userName = havePersistedUserName || "";

        if(!havePersistedUserName) this.initLoginHandler();
        else this.createLobby();
    }
    
    initLoginHandler() {

        const loginTemplate = `
            <div class="login">
                <h2 class="welcomeTitle">Dots and Boxes</h2>
                <p>Nam pariatur quisquam. Nobis suscipit assumenda eveniet. Facere minus sunt.Repudiandae necessitatibus architecto iusto facilis. Quia sit asperiores aliquam est beatae asperiores provident. Necessitatibus sed non velit sed autem doloremque et sed reiciendis. Ex et a suscipit. Et et voluptatibus.</p>
                <div class="form">
                    <label for="username">Enter your Name :</label>
                    <input maxlength="6" id="username" name="username" />
                </div>
                <button disabled id="loginBtn">Submit</button>
            </div>
        `;


        appDOMEntry.innerHTML += loginTemplate;


        const loginBtn = document.getElementById("loginBtn");
        const usernameInput = document.getElementById("username");

        usernameInput.addEventListener("keyup" , e => {
            const inputValue = e.target.value;
            if(inputValue.length > 2) {
                loginBtn.removeAttribute("disabled");
            }else {
                loginBtn.setAttribute("disabled" , "")
            }

            this.userName = inputValue;
        })

        loginBtn.addEventListener("click" , () => {
            localStorage.setItem(this.USERNAME_PERSIST_KEY , this.userName);
            const login = appDOMEntry.querySelector(".login");

            login.classList.add("login-hide");

            let timer = setTimeout(() => {
                login.remove();
                this.createLobby();
                clearTimeout(timer);
            } , 1000);

        });
    }


    createLobby() {
        const lobbyTemplate = `
        <div class="lobby">
            <div class="intro">
            <h2>Welcome, <span>${this.userName}</span></h2>
            <p>You can select one of the current available matches for playing with other online players.</p>
            </div>
            <div class="mathContainer">
            <div class="matchTitle">
                <p>Online Match</p>
            </div>
            <div class="matchItem">
                <div class="user">
                <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M12,12A6,6,0,1,0,6,6,6.006,6.006,0,0,0,12,12ZM12,2A4,4,0,1,1,8,6,4,4,0,0,1,12,2Z"/><path d="M12,14a9.01,9.01,0,0,0-9,9,1,1,0,0,0,2,0,7,7,0,0,1,14,0,1,1,0,0,0,2,0A9.01,9.01,0,0,0,12,14Z"/></svg>
                <p>Hasan</p>
                </div>
                <div class="action">
                <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M20.494,7.968l-9.54-7A5,5,0,0,0,3,5V19a5,5,0,0,0,7.957,4.031l9.54-7a5,5,0,0,0,0-8.064Zm-1.184,6.45-9.54,7A3,3,0,0,1,5,19V5A2.948,2.948,0,0,1,6.641,2.328,3.018,3.018,0,0,1,8.006,2a2.97,2.97,0,0,1,1.764.589l9.54,7a3,3,0,0,1,0,4.836Z"/></svg>
                </div>
            </div>
            <div class="matchWithOfflinePlayer">
                <div>
                <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M12,12A6,6,0,1,0,6,6,6.006,6.006,0,0,0,12,12ZM12,2A4,4,0,1,1,8,6,4,4,0,0,1,12,2Z"/><path d="M12,14a9.01,9.01,0,0,0-9,9,1,1,0,0,0,2,0,7,7,0,0,1,14,0,1,1,0,0,0,2,0A9.01,9.01,0,0,0,12,14Z"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M12,12A6,6,0,1,0,6,6,6.006,6.006,0,0,0,12,12ZM12,2A4,4,0,1,1,8,6,4,4,0,0,1,12,2Z"/><path d="M12,14a9.01,9.01,0,0,0-9,9,1,1,0,0,0,2,0,7,7,0,0,1,14,0,1,1,0,0,0,2,0A9.01,9.01,0,0,0,12,14Z"/></svg>
                <p>Play with offline players</p>
                </div>
            </div>
            </div>
        </div>
        `;

        appDOMEntry.innerHTML += lobbyTemplate;

        const lobby = appDOMEntry.querySelector(".lobby");
        const matchWithOfflinePlayerBtn = lobby.querySelector(".matchWithOfflinePlayer");

        matchWithOfflinePlayerBtn.addEventListener("click" , () => {
            this.playground.createPlaygroundTemplate()
        })

        let timer = setTimeout(() => {
            lobby.classList.add('lobby-show');
            clearTimeout(timer);
        } , 100);
    }
}



const playgroundInstance = new Playground();
const session = new Session(playgroundInstance);
