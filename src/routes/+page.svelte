<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";

    let name = $state("");
    let greetMsg = $state("");

    async function greet(event: Event) {
        event.preventDefault();
        // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        greetMsg = await invoke("greet", { name });
    }
</script>

<div class="container pt-4 pb-12">
    <h1>Übersicht</h1>
    <p>Hier gibt es nur dann etwas zu sehen, wenn ich es geschafft habe, ein paar quality of life features einzubauen.</p>
    <a href="/book/3/0">Layouttest</a>
</div>