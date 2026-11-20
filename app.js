const API = "https://api.scryfall.com";
const cache = {};

const $ = (id) => document.getElementById(id);
const simbolo = (letra) => `https://svgs.scryfall.io/card-symbols/${letra}.svg`;
const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

const COLORES = {
    W: {
        nombre: "White",
        color: "var(--W)",
        lema: "Order, community and protection.",
        texto:
            "White seeks a fair and safe world. It works as a team: many small creatures " +
            "that strengthen each other, life gain, and rules that limit the opponent.",
        fortalezas: [
            "Small creatures that fight in groups",
            "Gaining life and protecting",
            "Removing threats with rules",
        ],
        debilidades: [
            "Few ways to draw cards",
            "Few direct-damage cards",
        ],
        ejemplos: ["Swords to Plowshares", "Serra Angel", "Wrath of God"],
    },
    U: {
        nombre: "Blue",
        color: "var(--U)",
        lema: "Knowledge, control and cunning.",
        texto:
            "Blue prefers to think before acting. It draws extra cards, returns things to the " +
            "opponent's hand and can counter their spells.",
        fortalezas: [
            "Drawing cards",
            "Counterspells",
            "Flying and evasive creatures",
        ],
        debilidades: [
            "Fragile creatures",
            "Little direct damage",
        ],
        ejemplos: ["Counterspell", "Mahamoti Djinn", "Brainstorm"],
    },
    B: {
        nombre: "Black",
        color: "var(--B)",
        lema: "Ambition, power and sacrifice.",
        texto:
            "Black will do whatever it takes to win. It eliminates creatures, brings cards back from the graveyard " +
            "and pays life or other resources in exchange for advantage.",
        fortalezas: [
            "Eliminating creatures",
            "Reanimating from the graveyard",
            "Searching for specific cards",
        ],
        debilidades: [
            "Costs life",
            "Little defense against enchantments",
        ],
        ejemplos: ["Dark Ritual", "Gray Merchant of Asphodel", "Doom Blade"],
    },
    R: {
        nombre: "Red",
        color: "var(--R)",
        lema: "Passion, impulse and freedom.",
        texto:
            "Red acts first and thinks later. It deals direct damage with lightning and fire, " +
            "and its creatures are fast and aggressive.",
        fortalezas: [
            "Direct damage",
            "Creatures with Haste",
            "Fast games",
        ],
        debilidades: [
            "Creatures with low toughness",
            "Runs out of cards quickly",
        ],
        ejemplos: ["Lightning Bolt", "Goblin Guide", "Shivan Dragon"],
    },
    G: {
        nombre: "Green",
        color: "var(--G)",
        lema: "Nature, growth and strength.",
        texto:
            "Green relies on brute force. It accelerates its mana with creatures and lands, " +
            "and plays enormous beasts that dominate combat.",
        fortalezas: [
            "Big creatures",
            "Accelerating mana",
            "Destroying artifacts and enchantments",
        ],
        debilidades: [
            "Few flying creatures",
            "No counterspells",
        ],
        ejemplos: ["Llanowar Elves", "Giant Growth", "Craterhoof Behemoth"],
    },
};

const TIPOS = [
    {
        nombre: "Creature",
        descripcion:
            "It's your army. Creatures attack the opponent and block their attacks. They have power " +
            "(the damage they deal) and toughness (the damage they can take before dying).",
        carta: "Shivan Dragon",
        datos: [
            ["When to play it", "Only during your main phase"],
            ["Stays in play", "Yes, until it dies or is removed"],
            ["Can attack", "From the next turn on (summoning sickness)"],
            ["Where to look", "The ability text and the power/toughness"],
        ],
        consejo:
            "Cast cheap creatures early on. Having bodies on the table early gives you pressure " +
            "and protects your life.",
    },
    {
        nombre: "Sorcery",
        descripcion:
            "A powerful one-use effect: deal damage, destroy things, draw cards. " +
            "After it resolves, it goes to the graveyard.",
        carta: "Wrath of God",
        datos: [
            ["When to play it", "Only during your main phase, with an empty stack"],
            ["Stays in play", "No, it goes to the graveyard"],
            ["Can be responded to", "Yes, the opponent can react with instants"],
            ["Example effect", "Destroy all creatures"],
        ],
        consejo:
            "Save your strongest sorceries for the moment they change the game; " +
            "don't spend them at random.",
    },
    {
        nombre: "Instant",
        descripcion:
            "Works like a sorcery, but you can cast it at any time, even on the " +
            "opponent's turn. That's why it lets you pull off surprises.",
        carta: "Lightning Bolt",
        datos: [
            ["When to play it", "Any time you have priority"],
            ["Stays in play", "No, it goes to the graveyard"],
            ["Can be responded to", "Yes, it uses the stack"],
            ["Example effect", "3 damage to any target"],
        ],
        consejo:
            "Leave mana untapped on the opponent's turn. That way you can respond with an instant " +
            "when they least expect it.",
    },
    {
        nombre: "Enchantment",
        descripcion:
            "A permanent effect that stays on the battlefield. It can help you, bother " +
            "the opponent or change the rules of the game.",
        carta: "Pacifism",
        datos: [
            ["When to play it", "Only during your main phase"],
            ["Stays in play", "Yes, until someone destroys it"],
            ["Can be attacked", "No, it's not a creature"],
            ["Example effect", "A creature can't attack or block"],
        ],
        consejo:
            "Enchantments are hard to remove for some colors, so they tend to be " +
            "safe investments.",
    },
    {
        nombre: "Artifact",
        descripcion:
            "A permanent object. Most have no color, so almost any deck can use it.",
        carta: "Sol Ring",
        datos: [
            ["When to play it", "Only during your main phase"],
            ["Stays in play", "Yes"],
            ["Color", "Usually colorless"],
            ["Example effect", "Produces extra mana every turn"],
        ],
        consejo:
            "A free or very cheap mana artifact speeds up your whole deck. It's one of the best " +
            "cards to start with.",
    },
    {
        nombre: "Planeswalker",
        descripcion:
            "A powerful ally. It enters with a number of loyalty counters and, each turn, you activate one of its " +
            "abilities, which raises or lowers that loyalty.",
        carta: "Chandra, Torch of Defiance",
        datos: [
            ["When to play it", "Only during your main phase"],
            ["Stays in play", "Yes, as long as it has loyalty"],
            ["Activation", "One ability per turn"],
            ["How it's attacked", "Your opponents must attack it directly"],
        ],
        consejo:
            "Protect your Planeswalker with creatures. If the opponent removes it quickly, " +
            "it didn't give you an advantage.",
    },
    {
        nombre: "Land",
        descripcion:
            "The source of your mana. It isn't cast and costs no mana: you simply play it, one per turn, " +
            "and tap it to get mana.",
        carta: "Command Tower",
        datos: [
            ["When to play it", "One per turn, during your main phase"],
            ["Stays in play", "Yes"],
            ["Can be responded to", "No, it doesn't use the stack"],
            ["Where to look", "The type of mana it produces"],
        ],
        consejo:
            "If your hand has few lands, it's normal to lose tempo. That's why the calculator " +
            "below helps you choose how many to run.",
    },
];

const HABILIDADES = [
    ["Flying", "Can only be blocked by creatures with Flying or Reach."],
    ["Haste", "Can attack the turn it enters."],
    ["Trample", "Excess damage goes through to the player."],
    ["Deathtouch", "Any damage it deals kills the creature."],
    ["Lifelink", "You gain life equal to the damage it deals."],
    ["Reach", "Can block creatures with Flying."],
    ["Vigilance", "Attacks without tapping, so it can also block."],
    ["Flash", "You can cast it at any time, like an instant."],
];

const PROPORCION_DE_TIERRAS = {
    40: 0.425,
    60: 0.4,
    100: 0.37,
};

function imagenDeCarta(carta, tamano = "normal") {
    const imagenes =
        carta.image_uris ||
        (carta.card_faces && carta.card_faces[0].image_uris) ||
        {};

    return imagenes[tamano] || "";
}

async function cargarCarta(nombre) {
    if (cache[nombre]) {
        return cache[nombre];
    }

    const respuesta = await fetch(`${API}/cards/named?fuzzy=${encodeURIComponent(nombre)}`);

    if (!respuesta.ok) {
        throw new Error("No se pudo cargar la carta");
    }

    cache[nombre] = await respuesta.json();
    return cache[nombre];
}

async function llenarCartas(raiz = document) {
    const pendientes = raiz.querySelectorAll(".mtg:not([data-listo])");

    for (const contenedor of pendientes) {
        contenedor.dataset.listo = 1;
        contenedor.textContent = "Loading...";

        try {
            const carta = await cargarCarta(contenedor.dataset.card);

            contenedor.innerHTML = `
                <a href="${carta.scryfall_uri}" target="_blank" rel="noopener">
                    <img loading="lazy" src="${imagenDeCarta(carta)}" alt="Card: ${carta.name}">
                </a>
                <small class="pie">${carta.name}</small>
            `;
        } catch (error) {
            contenedor.textContent = "Couldn't load the card.";
        }

        await esperar(110);
    }
}

function listaHtml(elementos) {
    return elementos.map((elemento) => `<li>${elemento}</li>`).join("");
}

function crearRuedaDeMana() {
    Object.entries(COLORES).forEach(([letra, datos]) => {
        const boton = document.createElement("button");

        boton.className = "mana";
        boton.setAttribute("aria-label", datos.nombre);
        boton.innerHTML = `<img src="${simbolo(letra)}" alt="">`;
        boton.onclick = () => {
            $("colores").scrollIntoView();
            bootstrap.Tab.getOrCreateInstance($(`tab-${letra}`)).show();
        };

        $("wheel").appendChild(boton);
    });
}

function crearPestanasDeColores() {
    Object.entries(COLORES).forEach(([letra, datos], indice) => {
        const activo = indice === 0;

        $("tabs-color").insertAdjacentHTML("beforeend", `
            <li class="nav-item">
                <button
                    id="tab-${letra}"
                    class="nav-link ${activo ? "active" : ""}"
                    style="--c: ${datos.color}"
                    data-bs-toggle="pill"
                    data-bs-target="#p-${letra}"
                >
                    <img src="${simbolo(letra)}" alt="">${datos.nombre}
                </button>
            </li>
        `);

        $("contenido-color").insertAdjacentHTML("beforeend", `
            <div class="tab-pane fade ${activo ? "show active" : ""}" id="p-${letra}" style="--c: ${datos.color}">
                <div class="row g-4">
                    <div class="col-lg-5">
                        <h3>${datos.nombre}</h3>
                        <p class="fst-italic">${datos.lema}</p>
                        <p>${datos.texto}</p>
                        <div class="chips"><span>Strengths</span></div>
                        <ul class="ft">${listaHtml(datos.fortalezas)}</ul>
                        <div class="chips"><span>Weaknesses</span></div>
                        <ul class="ft">${listaHtml(datos.debilidades)}</ul>
                    </div>
                    <div class="col-lg-7">
                        <div class="row g-2">
                            ${datos.ejemplos.map((nombre) => `
                                <div class="col-4">
                                    <div class="mtg" data-card="${nombre}"></div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>
            </div>
        `);
    });

    document.querySelectorAll("#tabs-color button").forEach((boton) => {
        boton.addEventListener("shown.bs.tab", () => {
            const idPanel = boton.dataset.bsTarget.slice(1);
            llenarCartas($(idPanel));
        });
    });
}

function crearAcordeonDeTipos() {
    TIPOS.forEach((tipo, indice) => {
        const abierto = indice === 0;

        $("acc-tipos").insertAdjacentHTML("beforeend", `
            <div class="accordion-item">
                <h3 class="accordion-header">
                    <button
                        class="accordion-button ${abierto ? "" : "collapsed"}"
                        data-bs-toggle="collapse"
                        data-bs-target="#t${indice}"
                    >
                        ${tipo.nombre}
                    </button>
                </h3>
                <div
                    id="t${indice}"
                    class="accordion-collapse collapse ${abierto ? "show" : ""}"
                    data-bs-parent="#acc-tipos"
                >
                    <div class="accordion-body">
                        <div class="row g-4">
                            <div class="col-lg-7">
                                <p class="tipo-desc">${tipo.descripcion}</p>
                                <div class="orn"><span>&#9670;</span></div>
                                <dl class="datos">
                                    ${tipo.datos.map(([etiqueta, valor]) => `
                                        <div>
                                            <dt>${etiqueta}</dt>
                                            <dd>${valor}</dd>
                                        </div>
                                    `).join("")}
                                </dl>
                                <div class="consejo">
                                    <b>Beginner tip</b>
                                    ${tipo.consejo}
                                </div>
                            </div>
                            <div class="col-lg-5 text-center">
                                <div class="mtg" data-card="${tipo.carta}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    });

    document.querySelectorAll("#acc-tipos .collapse").forEach((panel) => {
        panel.addEventListener("shown.bs.collapse", () => llenarCartas(panel));
    });
}

function crearHabilidades() {
    HABILIDADES.forEach(([nombre, descripcion]) => {
        $("habs").insertAdjacentHTML("beforeend", `
            <div class="col-6 col-md-3">
                <div class="hab">
                    <b>${nombre}</b>
                    ${descripcion}
                </div>
            </div>
        `);
    });
}

function crearCamposDeCalculadora() {
    const valorInicial = { R: 12, G: 8 };

    Object.entries(COLORES).forEach(([letra, datos]) => {
        $("c-colores").insertAdjacentHTML("beforeend", `
            <div class="col">
                <label class="small d-flex align-items-center gap-1">
                    <img src="${simbolo(letra)}" width="20" alt="${datos.nombre}">
                    <input
                        type="number"
                        min="0"
                        value="${valorInicial[letra] || 0}"
                        data-c="${letra}"
                        class="form-control form-control-sm"
                    >
                </label>
            </div>
        `);
    });
}

function calcularTierras() {
    const tamano = Number($("c-formato").value);
    const tierras = Math.round(tamano * PROPORCION_DE_TIERRAS[tamano]);

    const simbolos = [...document.querySelectorAll("#c-colores input")]
        .map((campo) => [campo.dataset.c, Number(campo.value) || 0])
        .filter(([, cantidad]) => cantidad > 0);

    const totalSimbolos = simbolos.reduce((suma, [, cantidad]) => suma + cantidad, 0);

    if (!totalSimbolos) {
        $("c-res").textContent = "Enter how many mana symbols each color uses.";
        return;
    }

    let restantes = tierras;
    const reparto = simbolos.map(([letra, cantidad], indice) => {
        const esUltimo = indice === simbolos.length - 1;
        const asignadas = esUltimo ? restantes : Math.round((tierras * cantidad) / totalSimbolos);

        restantes -= asignadas;
        return [letra, asignadas];
    });

    const segmentos = reparto
        .map(([letra, n]) => `<div style="flex: ${n}; background: var(--${letra})"></div>`)
        .join("");

    const detalle = reparto
        .map(([letra, n]) => `<img src="${simbolo(letra)}" width="20" alt=""> ${COLORES[letra].nombre}: <b>${n}</b>`)
        .join(" &nbsp; ");

    $("c-res").innerHTML = `
        <p class="mb-1">Run about <b>${tierras} lands</b> in a ${tamano}-card deck (${tamano - tierras} spells):</p>
        <div class="barra">${segmentos}</div>
        <p class="mb-0">${detalle}</p>
    `;
}

async function buscarCartas(evento) {
    evento.preventDefault();

    const consulta = [
        $("q").value.trim(),
        $("f-color").value && `c:${$("f-color").value}`,
        $("f-tipo").value && `t:${$("f-tipo").value}`,
    ]
        .filter(Boolean)
        .join(" ");

    $("estado").textContent = "Searching...";
    $("resultados").innerHTML = "";

    try {
        const respuesta = await fetch(`${API}/cards/search?q=${encodeURIComponent(consulta)}&unique=cards`);

        if (respuesta.status === 404) {
            $("estado").textContent = "No results. Try a different name or remove some filters.";
            return;
        }

        if (!respuesta.ok) {
            throw new Error("Error de la API");
        }

        const datos = await respuesta.json();
        const mostradas = datos.data.slice(0, 12);

        $("estado").textContent = `${datos.total_cards} cards found. Showing ${mostradas.length}.`;

        mostradas.forEach((carta) => {
            $("resultados").insertAdjacentHTML("beforeend", `
                <div class="col-6 col-md-4 col-lg-3 resultado">
                    <a href="${carta.scryfall_uri}" target="_blank" rel="noopener">
                        <img loading="lazy" src="${imagenDeCarta(carta)}" alt="${carta.name}">
                    </a>
                    <small>${carta.name}</small>
                </div>
            `);
        });
    } catch (error) {
        $("estado").textContent = "Error contacting the API. Please try again.";
    }
}

crearRuedaDeMana();
crearPestanasDeColores();
crearAcordeonDeTipos();
crearHabilidades();
crearCamposDeCalculadora();

$("c-formato").onchange = calcularTierras;
$("c-colores").oninput = calcularTierras;
$("form-buscar").addEventListener("submit", buscarCartas);

calcularTierras();

llenarCartas($("anatomia").closest("section"));
llenarCartas($("p-W"));
llenarCartas($("acc-tipos"));
