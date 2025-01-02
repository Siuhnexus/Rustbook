<script lang="ts">
    import '../app.css';
    import type { Snippet } from "svelte";

    let { children }: { children: Snippet } = $props();
</script>

<header class="fixed flex justify-center content-center py-4 z-50 top-0 left-0 right-0 text-stone-100 bg-stone-800 h-[var(--navbar-height)]">
    <nav class="flex gap-4">
        <a href="/welcome" class="w-full bg-stone-700 rounded-lg px-4 flex justify-center items-center">Willkommen</a>
        <a href="/" class="w-full bg-stone-700 rounded-lg px-4 flex justify-center items-center">Übersicht</a>
        <a href="/book" class="w-full bg-stone-700 rounded-lg px-4 flex justify-center items-center">Lesen</a>
    </nav>
</header>
<main class="bg-stone-900 text-stone-100 min-h-[100dvh] relative pt-[calc(var(--navbar-height))]">
    {@render children()}
</main>