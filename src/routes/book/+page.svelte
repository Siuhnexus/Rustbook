<script lang="ts">
    import Progressbar from "./Progressbar.svelte";

    let interactive = $state(false);
    let chapter = $state(0);
    let loading = $state(false);

    let reader: HTMLIFrameElement | undefined = $state();
    let loadedUrl: string | undefined = $state();

    $effect(() => {
        if(!reader) return
        reader.addEventListener("load", () => { loading = false })
    })
</script>

<h1>Aktueller Lesestand</h1>
<p>Gesamtfortschritt:</p>
<Progressbar value={100}></Progressbar>
<p>Zuletzt gelesen:</p>
<p>Nächste Leseempfehlung:</p>