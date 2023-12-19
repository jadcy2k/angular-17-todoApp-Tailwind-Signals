import { Component, computed, effect, signal } from '@angular/core';
import { FilterType, TodoModel } from '../../models/todo/todo.model';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Necesarios para 'FormControl'
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {

  // Lista de tareas inicial:
  todoList = signal<TodoModel[]>([
    // hardcoded:
    { id: 1, title: 'Buy milk',     completed: true, editing: false },
    { id: 2, title: 'Do homework',  completed: false, editing: false },
    { id: 3, title: 'Walk the dog', completed: false, editing: false },    
  ]);

  // Filtro
  filter = signal<FilterType>('all');

  // Cambiar filtro
  changeFilter = (filterStr: FilterType) => {
    this.filter.set(filterStr);
  };
  // -----------------------

  // Nuevo 'form control' para linkar en el input de 'nuevo todo':
  newTodo = new FormControl('',{
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  });
  // -----------------------

  // Creamos nuevo 'todo' a partir del form control 'newTodo':
  addTodo = () => {
    const newTaskTitle = this.newTodo.value.trim();
    if (this.newTodo.valid && newTaskTitle !== '') {
      // Actualizamos la signal 'todoList':
      this.todoList.update((curr_TodoList) => {
        return [
          ...curr_TodoList,
          { id: Date.now(), title: newTaskTitle, completed: false, editing: false }
        ];
      });
      this.newTodo.reset(); // o también: this.newTodo.setValue('')
    }
  };
  // -----------------------

  // Completar todo al hacer click en checkbox:
  toggleTodo = (id: number) => {
    // Actualizamos la signal 'todoList' mapeando todos los 'todo' y cambiando el 'completed' del id seleccionado:
    this.todoList.update((curr_TodoList) => {
      return curr_TodoList.map((todo) => {
        return todo.id === id ? { ...todo, completed: !todo.completed } : todo;
      });
    });
  };
  // -----------------------

  // Elimina un 'todo' al hacer click en 'X':
  removeTodo = (id: number) => {
    // Actualizamos la signal 'todoList' aplicando un filtro:
    this.todoList.update((curr_TodoList) => {
      return curr_TodoList.filter((todo) => todo.id !== id);
    });
  };
  // -----------------------

  // Editar un 'todo':
  editTodo = (id: number) => {
    // Actualizamos la signal 'todoList' mapeando todos los 'todo' y cambiando el 'editing' del id seleccionado:
    this.todoList.update((curr_TodoList) => {
      return curr_TodoList.map((todo) => {
        return todo.id === id ? { ...todo, editing: true } : todo;
      });
    });
  };
  // -----------------------

  // Guardar el título del 'todo' que está siendo editado:
  saveTodoTitle = (id: number, event:Event) => {
    // El título viene del 'event' al pulsar Enter:
    const newTitle = (event.target as HTMLInputElement).value;
    // Actualizamos la signal 'todoList' mapeando todos los 'todo' y cambiando el 'title' del id seleccionado:
    this.todoList.update((curr_TodoList) => {
      return curr_TodoList.map((todo) => {
        return todo.id === id ? { ...todo, title: newTitle, editing: false } : todo;
      });
    });
  };
  // -----------------------

  // Generar señal computada para 'filter':
  todoListFiltered = computed(() => {
    switch (this.filter()) {
      case 'active':
        return this.todoList().filter((todo) => !todo.completed);
      case 'completed':
        return this.todoList().filter((todo) => todo.completed);
      default:
        return this.todoList();
    }
  });
  // -----------------------

  // EN EL CONSTRUCTOR CREAMOS UN 'EFFECT' QUE GUARDA LA LISTA DE 'todos' EN LOCALSTORAGE:
  constructor() {        
    // Crear un 'effect' para guardar la lista de 'todos' en LocalStorage:
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this.todoList()));
    });
  };
  // -----------------------

  // CUANDO SE INICIALIZA Y CADA VEZ QUE SE RENDERICE EL COMPONENTE, OBTENEMOS LA LISTA DE 'todos' DEL LOCALSTORAGE:
  ngOnInit(): void {
    // Recuperar el 'todos' del LocalStorage:
    const storage = localStorage.getItem('todos');

    // Si existe un 'storage' guardado, entonces seteamos la señal 'todoList':
    if (storage) {
      this.todoList.set(JSON.parse(storage));
    }
  };
  // -----------------------
}
