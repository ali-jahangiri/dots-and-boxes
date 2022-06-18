const GRID = 4;
const BOX_SIZE = 128;

const container = document.getElementById("container");
const filledBoxesAreas = document.getElementById("filledBoxesAreas");

class Match {
    constructor() {
        this.playerColor = {
            red : "#f3849c",
            blue : "#8789f8"
        }

        this.start();

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

        this.createPlaygroundTemplate();
        this.match.start();
    }


    createPlaygroundTemplate() {
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


const playgroundInstance = new Playground();