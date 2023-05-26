//Declaración de variables
const apiButton = document.getElementById("apiButton");
const historial = document.getElementById("historial-div");
const clearHistorialButton = document.getElementById("clearHistorial");
const pokemonNameInput = document.getElementById("pokemonNameInput"); // Obtengo lo que haya escrito en el input del html
const tiposPokemon = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    electric: 'Eléctrico',
    grass: 'Planta',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero',
    fairy: 'Hada'
  }; // Los 18 tipos de Pokémon, esta constante en necesaria debido a que la api devuelve los tipos en inglés

const searchPokemon = () => {
    //Se ejecutará esta función para manejar el resultado de los eventos de presionar enter en el pokemonNameInput
    //o click en Buscar Pokémon.
    //Si se coloco en el el campo pokemonNameInput un nombre que se encuentre en la api de Pokémon, 
    //se realizara el llamado a la funcion callApi que retornara info filtrada del mismo, utilizando 
    //la libreria SweetAlert para personalizar la muestra de los datos, en caso contrario 
    //la libreria Toastify hara el manejo de errores/excepciones.
    const pokemon = pokemonNameInput.value?.toLowerCase();

    if (!pokemon) {
        return Toastify({
            text: "ESCRIBA UN POKEMON",
            gravity: "bottom", // `top` or `bottom`
            position: "left",
            className: "info",
            style: {
                background: "linear-gradient(to right, #CF010B, #991F36)",
            },
        }).showToast();
    }
    callApi(pokemon).then((data) => {
        if (!data) return //Me aseguro que hay datos en el llamado a la api.

        updateHistorial();
        Swal.fire({ // Imprimo los datos que se mostraran la ventana emergente que representa la ficha del Pokémon.
            title:
            `<h1 style="color:white; font-size: clamp(16px, 4vw, 32px);">${data.name.toUpperCase()}</h1><p style="font-size: clamp(12px, 3vw, 24px);">Número: ${data.id}<br>${data.category}<br>Tipo: ${data.type}</p>`,
            text: `Número: ${data.id}\t\tTipo: ${data.type}\n${data.description}`,
            text : `${data.description}`,
            imageUrl: data.sprite,
            imageWidth: 300,
            imageHeight: 300,
            imageAlt: "Custom image",
            confirmButtonColor: "#3085d6",
            customClass: {
                container: "swal-custom-container",
                popup: "swal-custom-popup",
                title: "swal-custom-title",
            },
            color: "white",
            background:
                "linear-gradient(0deg, rgba(1,5,15,1) 0%, rgba(0,0,22,1) 35%, rgba(0,212,255,1) 100%)",
            backdrop: `
                rgba(0, 139, 234,0.31)
            `,
        });
    });
};

const callApi = async (pokemonName) => {
    //Si el nombre del Pokémon dado por parámetro se busco con éxito previamente, estara almacenado en el localStorage
    //Con el fin de acelerar la busqueda de Pokémones ya buscados y evitar llamados a una api con enorme magnitud de información
    //retornamos directamente al Pokémon del localStorage con el nombre dado, que tendra toda la información necesaria
    //para imprimir sus datos.
    //Caso contrario, se realizara la busqueda en la api de Pokémon
    let pokemones = JSON.parse(localStorage.getItem("pokemones")) || [];
    
    const pokemonInStorage = pokemones.find(
        (pokemon) => pokemon.name === pokemonName || pokemon.id === parseInt(pokemonName)
    );

    if (pokemonInStorage) return pokemonInStorage;

    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`; // Parametrizo el pokemon a buscar
    return fetch(url)
        .then(response => response.json())
        .then( async (data) => {
            urlApiSpecies = data.species.url;
            const {description, genera} =  await getDescription(urlApiSpecies); // La descripcion esta en otra api, la separo en una función aparte.
            const type = `${tiposPokemon[data.types[0].type.name]}` // Formateo el tipo en español, la api lo devuelve en inglés.
            const pokemonSaved = { // Preparo un objeto con todos los datos que me interesan del pokemon
                name: data.name,
                id: data.id,
                category: genera,
                sprite: data.sprites.other["official-artwork"].front_default,
                description: description,
                type: type
            }

            pokemones.push(pokemonSaved); // Guardo el nuevo pokemon buscado por la api en la lista de Pokémones.
            localStorage.setItem("pokemones", JSON.stringify(pokemones)); // Actualizo la lista de Pokémones del localStorage, para futuras búsquedas del mismo.

            return pokemonSaved;
        })
        .catch((error) => { // En caso de que en el input se haya colocado un nombre que no existe en la api, podemos asumir que el Pokémon no existe.
            Swal.fire({     // Arrojamos la excepcion acorde.
                title: "No encontrado",
                text: `El Pokemon ${pokemonName} no existe`,
                icon: "error",
                confirmButtonText: "Ok",
            });
        });
};

function updateHistorial() {
    // Actualizo la lista del Historial de Pokemon. Si no tengo ninguna data en el localStorage, nunca se
    // realizo una busqueda exitosa, por ende, oculto el botón de "Limpiar Historial". 
    // En caso de tener data en el localStorage, habilito el boton de "Limpiar Historial"
    // e inyecto en el html la lista completa, 
    const pokemones = JSON.parse(localStorage.getItem("pokemones"));
    historial.innerHTML = ""
    if (!pokemones) {
        clearHistorialButton.style.visibility = "hidden";
    } else {
        historial.style.display = 'block';
        clearHistorialButton.style.visibility = "visible";

        pokemones.forEach(
            (pokemon) => {
                let item = document.createElement("li");
                item.className = 'historial-item';
                item.innerHTML = `${capitalize(pokemon.name)}`;
                historial.append(item);
            }
        )
    }
}
function clearHistorial() {
    //Borro totalmente el localStorage, y llamo a la funcion para actualizar el historial
    //La funcion detectara que no tengo pokemones el localStorage, por ende, nunca realice una busqueda exitosa 
    // y automaticamente ocultara el boton de "Limpiar Historial".
    localStorage.clear();
    updateHistorial();
}
function capitalize(str) {
    //Funcion auxiliar para convertir el primer carácter de una cadena de texto en mayúscula y los demás caracteres en minúscula.
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function getDescription(url) {
    // Recorro la data de la api, y aislo los dos datos que necesio, la descripcion en español del pokemon y su categoria.
    let description = "vacio";
    let genera = "vacio"
    return fetch(url)
        .then(response => response.json())
        .then((data) => {
            description = data.flavor_text_entries.find(element => element.language.name === "es"
            )?.flavor_text; 
            genera = data.genera.find(element => element.language.name === "es"
            )?.genus;
            return {description,genera};
        })
        .catch((error) => { // En caso de respuesta no exitosa, lanzo la excepcion (en este punto, es muy raro que pase).
            Swal.fire({
                title: "No encontrado",
                text: `La información del Pokemon esta incompleta`,
                icon: "error",
                confirmButtonText: "Ok",
            });
            return description;
        });
}

//Detecto si se presiono alguno de los botones (Buscar Pokémon/Limpia Historial).
apiButton.addEventListener("click", searchPokemon); 
clearHistorialButton.addEventListener("click", clearHistorial);
//Detecto si se presiono la tecla Enter como evento para la búsqueda.
pokemonNameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") searchPokemon();
});
updateHistorial(); //Inicializo el historial.
