const APIs = (() => {
    const URL = "http://localhost:3000/todos";

    const addTodo = (newTodo) => {
        return fetch(URL, {
            method: "POST",
            body: JSON.stringify({content: newTodo, 'completed': false}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'applicaction/json'
            }
        }).then((res) => {
            return res.json();
        })
    }

    const editTodo = (id, data) => {
        return fetch(`${URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'applicaction/json'
            }
        }).then((res) => {
            return res.json();
        })
    }

    const deleteTodo = (id) => {
        return fetch(`${URL}/${id}`, {
            method: "DELETE"
        }).then((res) => {
            return res.json();
        })
    };

    const getTodos = () => {
        return fetch(`${URL}`).then((res) => {
            return res.json();
        })
    }

    return {
        getTodos,
        deleteTodo,
        addTodo,
        editTodo
    }
})()




/*
    closure, IIFE
    event bubbling, event capturing
    json server
*/
const Model = (() => {
    class State {
        #todos;
        #onChangeCb;
        constructor() {
            this.#todos = [];
            this.#onChangeCb = () => { }
        }
        get todos() {
            return this.#todos
        }
        set todos(newTodos) {
            this.#todos = newTodos
            this.#onChangeCb();
        }

        subscribe = (cb) => {
            this.#onChangeCb = cb;
        }
    }
    return {
        State
    }

})();

/*
    [
        {content:"work",id:1},
        {content:"eat",id:2}
    ]
*/

const View = (() => {
    const formEl = document.querySelector(".todo__form");
    const todoListEl = document.querySelector(".todo__list");
    const renderTodolist = (todos) => {
        let template = "";
        todos.sort((a,b)=>b.id-a.id).forEach((todo) => {
            template += `
                <li id="task${todo.id}"><span>${todo.content}</span><button class="btn--edit" id="${todo.id}">Edit</button><button class="btn--delete" id="${todo.id}">Delete</button></li>
            `
        })
        if (template.length === 0) {
            template = "<h2>No active tasks</h2>";
        }
        todoListEl.innerHTML = template;
    }
    return {
        formEl,
        renderTodolist,
        todoListEl
    }
})();



const ViewModel = ((Model, View) => {
    const state = new Model.State();

    const addTodo = () => {
        View.formEl.addEventListener("submit", (event) => {
            event.preventDefault();
            const content = event.target[0].value;
            if(content.trim() === "") return;
            APIs.addTodo(content).then(res => {
                //console.log("Res", res);
                state.todos = [res, ...state.todos];//anti-pattern
                event.target[0].value = "";
            })

        })
    }

    const deleteTodo = () => {
        View.todoListEl.addEventListener("click", (event) => {
            //console.log(event.currentTarget, event.target)
            const { id } = event.target
            if (event.target.className === "btn--delete") {
                APIs.deleteTodo(id).then(res => {
                    //console.log("Res", res);
                    state.todos = state.todos.filter((todo) => {
                        return +todo.id !== +id
                    });
                });
            }
        })
    }

    const editTodo = () => {
        View.todoListEl.addEventListener("click", (event) => {
            //console.log('target', event.target);
            let editButton = event.target;
            let parent = editButton.parentNode;
            //console.log(parent);
            const { id } = event.target;
            console.log(id);
            let currentState = state.todos.filter(todo => +todo.id === +id);
            //console.log(currentState);
            if (event.target.className === "btn--edit") {
                //const input = document.createElement('input');
                let span = parent.firstElementChild;
                let oldButton = parent.children[1];
                //console.log(oldButton);
                let input = document.createElement('input');
                input.value = span.textContent;
                let newButton = document.createElement('button');
                newButton.className = "btn--edit2";
                newButton.textContent = 'Edit';
                newButton.id = id;
                parent.replaceChild(input, span);
                parent.replaceChild(newButton, oldButton);
            }
            if (event.target.className === "btn--edit2") {
                let input = parent.firstElementChild;
                //console.log(input.value);
                data = {
                    'content': input.value,
                    'completed' : currentState[0].completed
                }
                APIs.editTodo(id, data)
                    .then(res => {
                        console.log(res);
                        state.todos = state.todos.map(todo => +todo.id === +id ? {...todo, "content": input.value} : todo);
                    })
            }
        })
    }

    const getTodos = ()=>{
        APIs.getTodos().then(res=>{
            state.todos = res;
        })
    }

    const bootstrap = () => {
        addTodo();
        deleteTodo();
        getTodos();
        editTodo();
        state.subscribe(() => {
            View.renderTodolist(state.todos)
        });
    }
    return {
        bootstrap
    }
})(Model, View);

ViewModel.bootstrap();


