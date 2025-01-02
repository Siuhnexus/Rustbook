<script lang="ts">
    import hljs from "highlight.js/lib/core"
    import rust from "highlight.js/lib/languages/rust"
    import bash from "highlight.js/lib/languages/bash"
    import powershell from "highlight.js/lib/languages/powershell"
    import plaintext from "highlight.js/lib/languages/plaintext"
    import type { Snippet } from "svelte"
    import "highlight.js/styles/a11y-dark.min.css"
    import { afterNavigate } from "$app/navigation"
    import { open } from "@tauri-apps/plugin-shell"

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

<div>
    <div class="fixed top-[var(--navbar-height)] z-40 left-0 w-[300px] bottom-0 overflow-y-auto bg-[#282d3f] text-[#bcbdd0] text-[0.875em] shrink-0 p-[10px] flex flex-col">
        <a class="nav-item" href="/book/0">The Rust Programming Language</a>
        <a class="nav-item" href="/book/1">Foreword</a>
        <a class="nav-item" href="/book/2">Introduction</a>
        <a class="nav-item" href="/book/3">1. Getting Started</a>
        <a class="nav-item pl-6" href="/book/3/0">1.1. Installation</a>
        <a class="nav-item pl-6" href="/book/3/1">1.2. Hello, World!</a>
        <a class="nav-item pl-6" href="/book/3/2">1.3. Hello, Cargo!</a>
        <a class="nav-item" href="/book/4">2. Programming a Guessing Game</a>
        <a class="nav-item" href="/book/5">3. Common Programming Concepts</a>
        <a class="nav-item pl-6" href="/book/5/0">3.1. Variables and Mutability</a>
        <a class="nav-item pl-6" href="/book/5/1">3.2. Data Types</a>
        <a class="nav-item pl-6" href="/book/5/2">3.3. Functions</a>
        <a class="nav-item pl-6" href="/book/5/3">3.4. Comments</a>
        <a class="nav-item pl-6" href="/book/5/4">3.5. Control Flow</a>
        <a class="nav-item" href="/book/6">4. Understanding Ownership</a>
        <a class="nav-item pl-6" href="/book/6/0">4.1. What is Ownership?</a>
        <a class="nav-item pl-6" href="/book/6/1">4.2. References and Borrowing</a>
        <a class="nav-item pl-6" href="/book/6/2">4.3. The Slice Type</a>
        <a class="nav-item" href="/book/7">5. Using Structs to Structure Related Data</a>
        <a class="nav-item pl-6" href="/book/7/0">5.1. Defining and Instantiating Structs</a>
        <a class="nav-item pl-6" href="/book/7/1">5.2. An Example Program Using Structs</a>
        <a class="nav-item pl-6" href="/book/7/2">5.3. Method Syntax</a>
        <a class="nav-item" href="/book/8">6. Enums and Pattern Matching</a>
        <a class="nav-item pl-6" href="/book/8/0">6.1. Defining an Enum</a>
        <a class="nav-item pl-6" href="/book/8/1">6.2. The match Control Flow Construct</a>
        <a class="nav-item pl-6" href="/book/8/2">6.3. Concise Control Flow with if let</a>
        <a class="nav-item" href="/book/9">7. Managing Growing Projects with Packages, Crates, and Modules</a>
        <a class="nav-item pl-6" href="/book/9/0">7.1. Packages and Crates</a>
        <a class="nav-item pl-6" href="/book/9/1">7.2. Defining Modules to Control Scope and Privacy</a>
        <a class="nav-item pl-6" href="/book/9/2">7.3. Paths for Referring to an Item in the Module Tree</a>
        <a class="nav-item pl-6" href="/book/9/3">7.4. Bringing Paths Into Scope with the use Keyword</a>
        <a class="nav-item pl-6" href="/book/9/4">7.5. Separating Modules into Different Files</a>
        <a class="nav-item" href="/book/10">8. Common Collections</a>
        <a class="nav-item pl-6" href="/book/10/0">8.1. Storing Lists of Values with Vectors</a>
        <a class="nav-item pl-6" href="/book/10/1">8.2. Storing UTF-8 Encoded Text with Strings</a>
        <a class="nav-item pl-6" href="/book/10/2">8.3. Storing Keys with Associated Values in Hash Maps</a>
        <a class="nav-item" href="/book/11">9. Error Handling</a>
        <a class="nav-item pl-6" href="/book/11/0">9.1. Unrecoverable Errors with panic!</a>
        <a class="nav-item pl-6" href="/book/11/1">9.2. Recoverable Errors with Result</a>
        <a class="nav-item pl-6" href="/book/11/2">9.3. To panic! or Not to panic!</a>
        <a class="nav-item" href="/book/12">10. Generic Types, Traits, and Lifetimes</a>
        <a class="nav-item pl-6" href="/book/12/0">10.1. Generic Data Types</a>
        <a class="nav-item pl-6" href="/book/12/1">10.2. Traits: Defining Shared Behavior</a>
        <a class="nav-item pl-6" href="/book/12/2">10.3. Validating References with Lifetimes</a>
        <a class="nav-item" href="/book/13">11. Writing Automated Tests</a>
        <a class="nav-item pl-6" href="/book/13/0">11.1. How to Write Tests</a>
        <a class="nav-item pl-6" href="/book/13/1">11.2. Controlling How Tests Are Run</a>
        <a class="nav-item pl-6" href="/book/13/2">11.3. Test Organization</a>
        <a class="nav-item" href="/book/14">12. An I/O Project: Building a Command Line Program</a>
        <a class="nav-item pl-6" href="/book/14/0">12.1. Accepting Command Line Arguments</a>
        <a class="nav-item pl-6" href="/book/14/1">12.2. Reading a File</a>
        <a class="nav-item pl-6" href="/book/14/2">12.3. Refactoring to Improve Modularity and Error Handling</a>
        <a class="nav-item pl-6" href="/book/14/3">12.4. Developing the Library’s Functionality with Test Driven Development</a>
        <a class="nav-item pl-6" href="/book/14/4">12.5. Working with Environment Variables</a>
        <a class="nav-item pl-6" href="/book/14/5">12.6. Writing Error Messages to Standard Error Instead of Standard Output</a>
        <a class="nav-item" href="/book/15">13. Functional Language Features: Iterators and Closures</a>
        <a class="nav-item pl-6" href="/book/15/0">13.1. Closures: Anonymous Functions that Capture Their Environment</a>
        <a class="nav-item pl-6" href="/book/15/1">13.2. Processing a Series of Items with Iterators</a>
        <a class="nav-item pl-6" href="/book/15/2">13.3. Improving Our I/O Project</a>
        <a class="nav-item pl-6" href="/book/15/3">13.4. Comparing Performance: Loops vs. Iterators</a>
        <a class="nav-item" href="/book/16">14. More about Cargo and Crates.io</a>
        <a class="nav-item pl-6" href="/book/16/0">14.1. Customizing Builds with Release Profiles</a>
        <a class="nav-item pl-6" href="/book/16/1">14.2. Publishing a Crate to Crates.io</a>
        <a class="nav-item pl-6" href="/book/16/2">14.3. Cargo Workspaces</a>
        <a class="nav-item pl-6" href="/book/16/3">14.4. Installing Binaries from Crates.io with cargo install</a>
        <a class="nav-item pl-6" href="/book/16/4">14.5. Extending Cargo with Custom Commands</a>
        <a class="nav-item" href="/book/17">15. Smart Pointers</a>
        <a class="nav-item pl-6" href="/book/17/0">15.1. Using Box&lt;T&gt; to Point to Data on the Heap</a>
        <a class="nav-item pl-6" href="/book/17/1">15.2. Treating Smart Pointers Like Regular References with the Deref Trait</a>
        <a class="nav-item pl-6" href="/book/17/2">15.3. Running Code on Cleanup with the Drop Trait</a>
        <a class="nav-item pl-6" href="/book/17/3">15.4. Rc&lt;T&gt;, the Reference Counted Smart Pointer</a>
        <a class="nav-item pl-6" href="/book/17/4">15.5. RefCell&lt;T&gt; and the Interior Mutability Pattern</a>
        <a class="nav-item pl-6" href="/book/17/5">15.6. Reference Cycles Can Leak Memory</a>
        <a class="nav-item" href="/book/18">16. Fearless Concurrency</a>
        <a class="nav-item pl-6" href="/book/18/0">16.1. Using Threads to Run Code Simultaneously</a>
        <a class="nav-item pl-6" href="/book/18/1">16.2. Using Message Passing to Transfer Data Between Threads</a>
        <a class="nav-item pl-6" href="/book/18/2">16.3. Shared-State Concurrency</a>
        <a class="nav-item pl-6" href="/book/18/3">16.4. Extensible Concurrency with the Sync and Send Traits</a>
        <a class="nav-item" href="/book/19">17. Object Oriented Programming Features of Rust</a>
        <a class="nav-item pl-6" href="/book/19/0">17.1. Characteristics of Object-Oriented Languages</a>
        <a class="nav-item pl-6" href="/book/19/1">17.2. Using Trait Objects That Allow for Values of Different Types</a>
        <a class="nav-item pl-6" href="/book/19/2">17.3. Implementing an Object-Oriented Design Pattern</a>
        <a class="nav-item" href="/book/20">18. Patterns and Matching</a>
        <a class="nav-item pl-6" href="/book/20/0">18.1. All the Places Patterns Can Be Used</a>
        <a class="nav-item pl-6" href="/book/20/1">18.2. Refutability: Whether a Pattern Might Fail to Match</a>
        <a class="nav-item pl-6" href="/book/20/2">18.3. Pattern Syntax</a>
        <a class="nav-item" href="/book/21">19. Advanced Features</a>
        <a class="nav-item pl-6" href="/book/21/0">19.1. Unsafe Rust</a>
        <a class="nav-item pl-6" href="/book/21/1">19.2. Advanced Traits</a>
        <a class="nav-item pl-6" href="/book/21/2">19.3. Advanced Types</a>
        <a class="nav-item pl-6" href="/book/21/3">19.4. Advanced Functions and Closures</a>
        <a class="nav-item pl-6" href="/book/21/4">19.5. Macros</a>
        <a class="nav-item" href="/book/22">20. Final Project: Building a Multithreaded Web Server</a>
        <a class="nav-item pl-6" href="/book/22/0">20.1. Building a Single-Threaded Web Server</a>
        <a class="nav-item pl-6" href="/book/22/1">20.2. Turning Our Single-Threaded Server into a Multithreaded Server</a>
        <a class="nav-item pl-6" href="/book/22/2">20.3. Graceful Shutdown and Cleanup</a>
    </div>
    <div class="ml-[300px] bg-[#161923] min-h-[calc(100dvh-var(--navbar-height))] flex pb-10">
        <div class="mx-auto max-w-[750px] book">
            {@render children()}
        </div>
    </div>
</div>