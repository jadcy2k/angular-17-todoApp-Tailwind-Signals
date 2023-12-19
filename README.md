# 'TODO APP' CON ANGULAR 17, TAILWIND CSS Y SIGNALS

## SETUP (NUEVO PROYECTO ANGULAR + TAILWIND_CSS)

https://tailwindcss.com/docs/guides/angular

```js
// 1) Crear nuevo proyecto:
ng new my-project
cd my-project

// 2) Instalar TailwindCSS (como dependencia DEV):
npm install -D tailwindcss postcss autoprefixer
// 3) Ejecutar comando 'init' para generar archivo 'tailwind.config.js':
npx tailwindcss init

// 4) Configurar 'tailwind.config.js':
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

// 5) Agragar directivas @tailwind al './src/styles.css':
@tailwind base;
@tailwind components;
@tailwind utilities;

// NOTA: Si VSCode lanza un warning en las directivas Tailwind, hay que modificar las preferencias (code > preferences > settings), y cambiar: "css.lint.unknownAtRules" = ignore.

// 6) Sustituir el contenido de 'app.compoment.html' por esto:
<h1 class="text-3xl font-bold underline">
  Hello world!
</h1>

// 7) Finalmente arrancar el proyecto en localhost:4200:
ng server --open
```
## EXTENSIÓN "CODEIUM" (Similar a GIT Copilot. Tiene versión gratuita)

https://codeium.com/

## (OPCIONAL) SOBREESCRIBIR TEMA PRINCIPAL DE 'TAILWIND CSS'

En el archivo 'tailwind.config.js' podremos extender el tema principal agregando estilos (colores, fuentes, ...)

```js
theme: {
    extend: {
      colors: {
        'primary': '#871CF8',
        'background-100': '#1A1A1A',
        'background-200': '#292929',
        'background-300': '#404040',
        'background-400': '#5B5B5B',
      }
    },
  }
```

## COMPONENTE 'TODO'

Así forzamos que lo cree en la carpeta 'app/components/':

```js
ng generate component componentst/todo
```


## RUTAS

Nuestra app será una SPA, pero igualmente podremos configurar las rutas para definir qué componente usaremos. Creamos una ruta a modo de ejemplo.

Modificamos `src/app/app.routes.ts`, importanto el componente `TodoComponent` y agregándolo en el array `routes` indicando su `path`. El segundo path ('**') es para redireccionar cualquier ruta a la inicial (todo):

```js
import { Routes } from '@angular/router';
import { TodoComponent } from './todo/todo.component';

export const routes: Routes = [
  { path: 'todo', component: TodoComponent },
  { path: '**', redirectTo: 'todo', pathMatch: 'full' },
];
```

Podemos hacer pruebas:

Si escribimos `localhost:4200` nos redirecciona a `localhost:4200/todo`.
Lo mismo si escribimos cualquier cosa tipo `localhost:4200/test/123/`.

## 'TODO' MODEL

Como `ng generate model` no existe (chequear $ ng generate --help), tenemos que hacerlo forzando el `--type` e indicando la ruta de la clase. 

**NOTA** usamos `--dry-run` para que haga un simulacro de la instrucción y así comprobar que se está creando lo que queremos. Hay que eliminar el '--dry-run' para que se genere los archivos de verdad:

```js
ng generate class models/todo/todo --type=model --dry-run // Simulacro.
ng generate class models/todo/todo --type=model // Ahora SÍ se crean.
```

### Interfaces y Types

Crearemos en ese archivo 'model' las siguientes interfaces y types para exportar:

```js
export interface TodoModel{
  id: number;
  title: string;
  completed: boolean;
  editing?: boolean;
}

export type FilterType  = 'all' | 'active' | 'completed';
```


## USO DE 'SIGNALS'

`Signals` se basa en una arquitectura de suscripción y eventos, lo que permite detectar y actualizar solo los cambios relevantes en lugar de recorrer todo el árbol de componentes.

Funcionan como un envoltorio alrededor de un valor que notifica a los consumidores interesados ​​cuando ese valor cambia. Las señales pueden contener cualquier valor, desde primitivos simples hasta estructuras de datos complejas. Pueden ser modificables o de sólo lectura.



### Signals modificables:

```ts
// Creación de signals (se puede expresar el tipo): 
const count = signal(0);
const filter = signal<FilterType>('all');

// Otra forma de expresarlo. Las 'writable signals' son de tipo 'WritableSignal':
const count:WritableSignal<number> = signal(0); 

// Leer su valor. Signals son funciones 'getter':
console.log('The count is: ' + count());
console.log('Filter is: ' + filter());

// Actualizar el valor con 'set':
count.set(3);
// Calcular nuevo valor con 'update' a partir del anterior:
count.update(value => value + 1);
```


### Signals computadas (read-only):

```ts
// 'Computed signals' se crean con la función 'computed()'.
/* La señal 'doubleCount' depende de la señal 'count'. Cada vez que count se actualiza, Angular sabe que doubleCount también necesita actualizarse. */ 
const count: WritableSignal<number> = signal(0);
const doubleCount: Signal<number> = computed(() => count() * 2);

// Al ser 'read-only', esto provocará un error:
doubleCount.set(3);
```


## FORMS y FORM CONTROLS

Podemos crear elementos de formulario con el comando `new FormControl()`

```ts
// Forma simple:
email: new FormControl('');
name: new FormControl('initial value');

// Pasando un objeto de configuración con parámetros como si admite 'nulls' o validadores:
newTodo = new FormControl('',{
  nonNullable: true,
  validators: [Validators.required, Validators.minLength(3)]
});
```
### Vincular 'FormControl' con 'input html':

Usaremos la propiedad [formControl] del input del template y le asignaremos el nombre del 'FormControl':

```ts
<input type="text" placeholder="Enter a new task" 
      [formControl]="newTodo" 
      (keyup.enter)="addTodo()">
// NOTA: Aquí se usa el evento (keyup.enter) para llamar al método 'addTodo()' cuando se presione ENTER.
```


### (OPCIONAL) Agrupados en 'FormGroup'

También se pueden agrupar dentro de un grupo llamado 'FormGroup':

```ts
profileForm = new FormGroup({
  name: new FormControl(''),
  email: new FormControl(''),
});
```





## EFFECTS y LOCALSTORAGE

Las señales (signals) avisan cuando cambian, por tanto un `effect` será una operación que se ejecutará cuando una o más señales cambien de valor.

```ts

// Este 'efecto' reaccionará cada vez que la señal 'todoList' cambie de valor:
effect(() => {
  localStorage.setItem('todos', JSON.stringify(this.todoList())); // Guardamos en LocalStorage el nuevo valor.
});
```

**IMPORTANTE** Ese `effect` se deberá de registrar en el 'CONSTRUCTOR' de la clase, para que esté disponible en todo el ciclo del componente.

## Crear 'effect' fuera del 'CONSTRUCTOR':

```ts
@Component({...})
export class MyComponent {
  // Definimos una señal:
  readonly count = signal(0);
  // Constructor al que pasamos 'injector'
  constructor(private injector: Injector) {}

  // Para registrar un 'effect' fuera del constructor, le pasamos el 'injector':
  initializeLogging(): void {
    effect(() => {
      console.log(`The count is: ${this.count()})`);
    }, {injector: this.injector});
  }
}
```



## ngOnInit()

Para acabar, deberemos de definir qué sucede en `ngOnInit()`, o sea lo que se ejecuta UNA SOLA VEZ, cuando la instancia del componente ya está inicializada. En nuestro caso, recuperar la información del LocalStorage:


```ts
ngOnInit(): void {
  // Recuperar el 'todos' del LocalStorage:
  const storage = localStorage.getItem('todos');

  // Si existe un 'storage' guardado, entonces seteamos la señal 'todoList':
  if (storage) {
    this.todoList.set(JSON.parse(storage));
  }
};
```












---
---
---
---
---
---
---
---
# PROJECT INFO

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
