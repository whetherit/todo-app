(function () {
	let data = localStorage.getItem("todos")
	let todos = []

	if (data && data !== "") {
		todos = JSON.parse(data)
	}

	function createAppTitle(title) {
		let appTitle = document.createElement("h2")
		appTitle.innerHTML = title
		return appTitle
	}

	function createTodoItemForm() {
		let form = document.createElement("form")
		let input = document.createElement("input")
		let buttonWrapper = document.createElement("div")
		let button = document.createElement("button")

		form.classList.add("input-group", "mb-3")
		input.classList.add("form-control")
		input.placeholder = "Введите название нового дела"
		buttonWrapper.classList.add("input-group-append")
		button.classList.add("btn", "btn-primary")
		button.textContent = "Добавить дело"
		button.disabled = true

		buttonWrapper.append(button)
		form.append(input)
		form.append(buttonWrapper)

		return {
			form,
			input,
			button,
		}
	}

	function createTodoList() {
		let list = document.createElement("ul")
		list.classList.add("list-group")
		return list
	}

	function createTodoItem(obj) {
		let item = document.createElement("li")
		let buttonGroup = document.createElement("div")
		let doneButton = document.createElement("button")
		let deleteButton = document.createElement("button")

		item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center")
		item.textContent = obj.name
		if (obj.done) {
			item.classList.add("list-group-item-success")
		}
		buttonGroup.classList.add("btn-group", "btn-group-sm")
		doneButton.classList.add("btn", "btn-success")
		doneButton.textContent = "Готово"
		deleteButton.classList.add("btn", "btn-danger")
		deleteButton.textContent = "Удалить"

		buttonGroup.append(doneButton)
		buttonGroup.append(deleteButton)
		item.append(buttonGroup)

		doneButton.addEventListener("click", async function () {
			item.classList.toggle("list-group-item-success")
			obj.done = !obj.done
			localStorage.setItem("todos", JSON.stringify(todos))
			await fetch(`http://localhost:3000/api/todos/${obj.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ done: obj.done }),
			})
		})

		deleteButton.addEventListener("click", async function () {
			if (confirm("Вы уверены?")) {
				const response = await fetch(`http://localhost:3000/api/todos/${obj.id}`, {
					method: "DELETE"
				})

				if (response.ok) {
					item.remove()
					todos = todos.filter(itemTodo => itemTodo.id !== obj.id)
					localStorage.setItem("todos", JSON.stringify(todos))
				} else {
					console.error("Ошибка при удалении дела:", response.statusText)
				}
			}
		})

		return {
			item,
		}
	}

	function createTodoApp(container, title = "Список дел") {
		let todoAppTitle = createAppTitle(title)
		let todoItemForm = createTodoItemForm()
		let todoList = createTodoList()

		container.append(todoAppTitle)
		container.append(todoItemForm.form)
		container.append(todoList)

		for (const todo of todos) {
			let todoItemElement = createTodoItem(todo)
			todoList.append(todoItemElement.item)
		}

		todoItemForm.input.addEventListener("input", function () {
			todoItemForm.button.disabled = !todoItemForm.input.value.trim()
		})

		todoItemForm.form.addEventListener("submit", async function (e) {
			e.preventDefault()

			if (!todoItemForm.input.value) {
				return
			}

			const response = await fetch("http://localhost:3000/api/todos", {
				method: "POST",
				body: JSON.stringify({
					name: todoItemForm.input.value.trim(),
					owner: "Захар"
				}),
				headers: {
					"Content-Type": "application/json",
				}
			})

			if (!response.ok) {
				console.error("Ошибка при создании дела:", response.statusText)
				return
			}

			const todoItem = await response.json()

			let obj = {
				id: todoItem.id,
				name: todoItemForm.input.value.trim(),
				done: false,
			}

			todos.push(obj)
			localStorage.setItem("todos", JSON.stringify(todos))

			let todoItemElement = createTodoItem(obj)
			todoList.append(todoItemElement.item)
			todoItemForm.input.value = ""
			todoItemForm.button.disabled = true
		})
	}

	window.createTodoApp = createTodoApp
})()