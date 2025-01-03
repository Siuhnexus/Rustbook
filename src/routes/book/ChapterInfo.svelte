<script lang="ts">
    import { getChapterTitle, type ProgressUpdate } from "./info.svelte";
    import Progressbar from "./Progressbar.svelte";

    let { recommendation }: { recommendation: ProgressUpdate | undefined } = $props()
    let title = recommendation ? getChapterTitle(recommendation.chapter, recommendation.subchapter) : ""
</script>

{#if recommendation}
    <a href="/book/{recommendation.chapter + (recommendation.subchapter != undefined ? "/" + recommendation.subchapter : "")}" class="block text-inherit! rounded-lg bg-black/30 p-4">
        <p>{title}</p>
        <Progressbar value={recommendation.newprogress * 100} small={true}></Progressbar>
    </a>
{:else}
    <div class="mb-6 italic">Kein Kapitel vorhanden.</div>
{/if}