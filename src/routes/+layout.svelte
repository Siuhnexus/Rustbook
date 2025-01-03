<script lang="ts">
    import '../app.css';
    import type { Snippet } from "svelte";
    import { invoke } from '@tauri-apps/api/core';
    import { open } from "@tauri-apps/plugin-shell"

    let { children }: { children: Snippet } = $props()

    let noAccess: boolean = $state(false);
    invoke<boolean>("check_data").then(v => {
        noAccess = !v
    });

    // @ts-ignore
    window.externallink = (link: string) => {
        if(link.startsWith("#")) {
            document.querySelector(link)?.scrollIntoView();
        }
        else if(!link.startsWith("https://")) {
            open("https://doc.rust-lang.org/book/" + link)
        }
        else {
            open(link)
        }
    }
</script>

<header class="fixed flex justify-center content-center py-4 z-50 top-0 left-0 right-0 text-stone-100 bg-stone-800 h-[var(--navbar-height)]">
    <nav class="flex gap-4">
        <a href="/" class="w-max bg-stone-700 rounded-lg px-4 flex justify-center items-center grow shrink-0">Willkommen</a>
        <a href="/book" class="w-max bg-stone-700 rounded-lg px-4 flex justify-center items-center grow shrink-0">Lesen</a>
        <a href="#" onclick={() => {
            //@ts-ignore
            window.externallink("https://github.com/Siuhnexus/AdventOfCode24Rust")
        }} class="w-max bg-stone-700 rounded-lg px-4 flex justify-center items-center grow shrink-0">Advent of Code repository</a>
    </nav>
    {#if noAccess}
        <div class="bg-red-800 rounded-lg mr-4 px-4 flex justify-center items-center">Kein Zugriff auf Dateien möglich. Bitte installieren Sie das Programm erneut.</div>
    {/if}
</header>
<main class="bg-stone-900 text-stone-100 min-h-[100dvh] relative pt-[calc(var(--navbar-height))]">
    {@render children()}
</main>