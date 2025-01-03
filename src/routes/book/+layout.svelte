<script lang="ts">
    import hljs from "highlight.js/lib/core"
    import rust from "highlight.js/lib/languages/rust"
    import bash from "highlight.js/lib/languages/bash"
    import powershell from "highlight.js/lib/languages/powershell"
    import plaintext from "highlight.js/lib/languages/plaintext"
    import type { Snippet } from "svelte"
    import "highlight.js/styles/a11y-dark.min.css"
    import { afterNavigate, beforeNavigate } from "$app/navigation"
    import { progress, titles, type Progress } from "./info.svelte";
    import { invoke } from "@tauri-apps/api/core";
    import { on } from "svelte/events";

    let { children }: { children: Snippet } = $props();

    hljs.registerLanguage("rust", rust)
    hljs.registerLanguage("bash", bash)
    hljs.registerLanguage("powershell", powershell)
    hljs.registerLanguage("console", bash)
    hljs.registerLanguage("plaintext", plaintext)
    hljs.registerLanguage("text", plaintext)
    $effect(() => {
        hljs.highlightAll()
    })
    afterNavigate(() => {
        hljs.highlightAll()
    })

    function getCurrentChapter(url: string) {
        if (!url.includes("book")) return
        let end = url.split(/book\/?/)[1]
        if (!progress.data || end == "") return undefined
        let parts = end.split("/")
        let chapter = parseInt(parts[0])
        let el = progress.data.chapters[chapter]
        let subchapter = undefined
        if (parts.length > 1 && parts[1] != "") {
            subchapter = parseInt(parts[1])
            el = el.chapters[subchapter]
        }
        return { obj: el, chapter, subchapter }
    }
    function getScrollInfo() {
        let scroller = document.querySelector("html")!
        let height = scroller.scrollHeight
        let elHeight = scroller.clientHeight
        let sHeight = height - elHeight
        return { el: scroller, height, elHeight, sHeight }
    }
    let currentChapter = $state(getCurrentChapter(window.location.href))
    beforeNavigate(nav => {
        console.log(nav.to?.url.href)
        currentChapter = getCurrentChapter(nav.to?.url.href ?? "")
        progress.scrollInit = currentChapter ? currentChapter.obj.progress : 0;
    })
    afterNavigate(() => {
        if (!currentChapter || currentChapter.obj.progress == 1) return
        let info = getScrollInfo();
        if (info.sHeight <= 0) {
            if (currentChapter.obj.progress < 1) {
                currentChapter.obj.progress = 1
                invoke("set_progress", { update: { chapter: currentChapter.chapter, subchapter: currentChapter.subchapter, newprogress: 1 } })
            }
        }
        else {
            info.el.scrollTop = info.sHeight * currentChapter.obj.progress
        }
    })

    invoke<Progress>("get_progress").then(v => {
        progress.data = v
    })

    on(window, "scrollend", e => {
        console.log("Scroll ended")
        if (!currentChapter) return
        if ((e.target as HTMLElement).tagName == undefined) {
            console.log("HTML element matched")
            let info = getScrollInfo();
            let ratio = info.el.scrollTop / info.sHeight
            console.log(ratio)
            if (ratio > currentChapter.obj.progress) {
                console.log("Saving...")
                currentChapter.obj.progress = ratio
                invoke("set_progress", { update: { chapter: currentChapter.chapter, subchapter: currentChapter.subchapter, newprogress: ratio } })
            }
        }
    })
</script>

<div>
    <div class="fixed top-[var(--navbar-height)] z-40 left-0 w-[300px] bottom-0 overflow-y-auto bg-[#282d3f] text-[#bcbdd0] text-[0.875em] shrink-0 p-[10px] flex flex-col">
        {#each titles as title, i}
            <a class="nav-item" href="/book/{i}">{title.title}</a>
            {#each title.chapters as sub, j}
                <a class="nav-item pl-6" href="/book/{i}/{j}">{sub}</a>
            {/each}
        {/each}
    </div>
    <div class="ml-[300px] bg-[#161923] min-h-[calc(100dvh-var(--navbar-height))] flex pb-10">
        <div class="mx-auto max-w-[750px] book">
            {@render children()}
        </div>
    </div>
</div>