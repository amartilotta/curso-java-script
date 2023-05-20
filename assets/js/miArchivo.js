const apiButton = document.getElementById("apiButton");
const historial = document.getElementById("historial");
const clearHistorialButton = document.getElementById("clearHistorial");
const pokemonNameInput = document.getElementById("pokemonNameInput"); // Obtengo lo que haya escrito en el input del html


const searchPokemon = () => {
    const pokemon = pokemonNameInput.value?.toLowerCase();

    if (!pokemon) {
        return Toastify({
            text: "ESCRIBA UN POKEMON",
            className: "info",
            style: {
                background: "linear-gradient(to right, #CF010B, #991F36)",
            },
        }).showToast();
    }
    callApi(pokemon).then((data) => {
        if (!data) return

        updateHistorial()
        Swal.fire({
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
    let pokemones = JSON.parse(localStorage.getItem("pokemones")) || [];
    const pokemonInStorage = pokemones.find(
        (pokemon) => pokemon.name === pokemonName
    );

    if (pokemonInStorage) return pokemonInStorage;

    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`; // Parametrizo el pokemon a buscar
    return fetch(url)
        .then(response => response.json())
        .then( async (data) => {
            urlApiSpecies = data.species.url
            const {descripcion, genera} =  await obtenerDescripcion(urlApiSpecies)

            const pokemonSaved = {
                name: data.name,
                id: data.id,
                category: genera,
                sprite: data.sprites.other["official-artwork"].front_default,
                description: descripcion,
                type:data.types[0].type.name
            }

            //obtenerEspecie()
            pokemones.push(pokemonSaved);
            localStorage.setItem("pokemones", JSON.stringify(pokemones));

            return pokemonSaved;
        })
        .catch((error) => {
            Swal.fire({
                title: "No encontrado",
                text: `El Pokemon ${pokemonName} no existe`,
                icon: "error",
                confirmButtonText: "Ok",
            });
        });
};

function updateHistorial() {
    const pokemones = JSON.parse(localStorage.getItem("pokemones"));
    if (!pokemones) {
        historial.innerHTML = ""
        clearHistorialButton.style.visibility = "hidden"
    } else {
        clearHistorialButton.style.visibility = "visible"

        historial.innerHTML = `
            <h2>HISTORIAL DE POKEMON</h2>
            - ${pokemones.map((pokemon) => capitalize(pokemon.name)).join("<br> - ")}
        `
    }
}
function clearHistorial() {
    localStorage.clear()
    updateHistorial()
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function obtenerDescripcion(url) {
    let descripcion = "vacio";
    let genera = "vacio"
    return fetch(url)
        .then(response => response.json())
        .then((data) => {
            descripcion = data.flavor_text_entries.find(element => element.language.name === "es"
            )?.flavor_text;
            genera = data.genera.find(element => element.language.name === "es"
            )?.genus;
            console.log(descripcion)
            //data.species.flavor_text_entries.forEach((entry) => {
            //descripcion = data.flavor_text_entries[28].flavor_text

            return {descripcion,genera};
        })
        .catch((error) => {
            Swal.fire({
                title: "No encontrado",
                text: `El Pokemon  no existe`,
                icon: "error",
                confirmButtonText: "Ok",
            });
            return descripcion;
        });

}

apiButton.addEventListener("click", searchPokemon);
clearHistorialButton.addEventListener("click", clearHistorial);

pokemonNameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") searchPokemon();
});
updateHistorial()
