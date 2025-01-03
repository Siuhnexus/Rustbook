<script lang="ts">
  import ChapterInfo from "./ChapterInfo.svelte";
    import { progress } from "./info.svelte";
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
<Progressbar value={progress.totalProgress * 100}></Progressbar>
<p>Noch nicht vervollständigt:</p>
<ChapterInfo recommendation={progress.firstNonfinished}></ChapterInfo>
<p>Nächste Leseempfehlung:</p>
<ChapterInfo recommendation={progress.nextRecommendation}></ChapterInfo>