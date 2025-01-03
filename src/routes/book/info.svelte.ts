export type Chapter = {
    chapters: Chapter[],
    progress: number
}

export type Progress = {
    chapters: Chapter[]
}

export type ProgressUpdate = {
    chapter: number,
    subchapter?: number,
    newprogress: number
}

let data: Progress | undefined = $state()
let currentInit = $state(0)
let firstNonfinished: ProgressUpdate | undefined = $derived.by(() => {
    for(let i = 0; i < (data?.chapters.length ?? 0); i++) {
        const chapter = data!.chapters[i]
        if (chapter.progress < 1 && chapter.progress > 0) {
            return { chapter: i, newprogress: chapter.progress }
        }
        for(let j = 0; j < chapter.chapters.length; j++) {
            const subchapter = chapter.chapters[j]
            if (subchapter.progress > 0 && subchapter.progress < 1) {
                return { chapter: i, subchapter: j, newprogress: subchapter.progress }
            }
        }
    }
    return undefined
})

const recommended = [0, 3, 4, 5, 7, 8, 9, 11, 14, 15, 16, 17, 19]
let nextRecommendation: ProgressUpdate | undefined = $derived.by(() => {
    for(let i = 0; i < (data?.chapters.length ?? 0); i++) {
        const chapter = data!.chapters[i]
        if(recommended.includes(i)) {
            if(chapter.progress == 0) return { chapter: i, newprogress: chapter.progress }
            const unstarted_subs = chapter.chapters.map((sub, i) => { return { sub, i } }).filter(({sub}) => sub.progress == 0)
            if(unstarted_subs.length > 0) {
                const first = unstarted_subs[0]
                return { chapter: i, subchapter: first.i, newprogress: first.sub.progress }
            }
        }
    }
    return undefined
})
let totalProgress = $derived.by(() => {
    let result = data?.chapters.reduce((prev, current) => {
        let sub = current.chapters.reduce((prev, current) => {
            prev.ratio += current.progress;
            prev.of += 1;
            return prev
        }, { ratio: 0, of: 0 })
        prev.ratio += sub.ratio + current.progress;
        prev.of += sub.of + 1;
        return prev
    }, { ratio: 0, of: 0 })
    return result == undefined ? 0 : result?.ratio / result.of
})

export let progress = {
    get data(): Progress | undefined { return data },
    set data(v: Progress) { data = v },
    get scrollInit() { return currentInit },
    set scrollInit(v: number) {
        currentInit = v
    },
    get nextRecommendation() {
        return nextRecommendation
    },
    get firstNonfinished() {
        return firstNonfinished
    },
    get totalProgress() {
        return totalProgress
    }
}

export const titles = [
    { title: "The Rust Programming Language", chapters: [] },
    { title: "Foreword", chapters: [] },
    { title: "Introduction", chapters: [] },
    { title: "1. Getting Started", chapters: ["1.1. Installation", "1.2. Hello, World!", "1.3. Hello, Cargo!"] },
    { title: "2. Programming a Guessing Game", chapters: [] },
    { title: "3. Common Programming Concepts", chapters: ["3.1. Variables and Mutability", "3.2. Data Types", "3.3. Functions", "3.4. Comments", "3.5. Control Flow"] },
    { title: "4. Understanding Ownership", chapters: ["4.1. What is Ownership?", "4.2. References and Borrowing", "4.3. The Slice Type"] },
    { title: "5. Using Structs to Structure Related Data", chapters: ["5.1. Defining and Instantiating Structs", "5.2. An Example Program Using Structs", "5.3. Method Syntax"] },
    { title: "6. Enums and Pattern Matching", chapters: ["6.1. Defining an Enum", "6.2. The match Control Flow Construct", "6.3. Concise Control Flow with if let"] },
    { title: "7. Managing Growing Projects with Packages, Crates, and Modules", chapters: ["7.1. Packages and Crates", "7.2. Defining Modules to Control Scope and Privacy", "7.3. Paths for Referring to an Item in the Module Tree", "7.4. Bringing Paths Into Scope with the use Keyword", "7.5. Separating Modules into Different Files"] },
    { title: "8. Common Collections", chapters: ["8.1. Storing Lists of Values with Vectors", "8.2. Storing UTF-8 Encoded Text with Strings", "8.3. Storing Keys with Associated Values in Hash Maps"] },
    { title: "9. Error Handling", chapters: ["9.1. Unrecoverable Errors with panic!", "9.2. Recoverable Errors with Result", "9.3. To panic! or Not to panic!"] },
    { title: "10. Generic Types, Traits, and Lifetimes", chapters: ["10.1. Generic Data Types", "10.2. Traits: Defining Shared Behavior", "10.3. Validating References with Lifetimes"] },
    { title: "11. Writing Automated Tests", chapters: ["11.1. How to Write Tests", "11.2. Controlling How Tests Are Run", "11.3. Test Organization"] },
    { title: "12. An I/O Project: Building a Command Line Program", chapters: ["12.1. Accepting Command Line Arguments", "12.2. Reading a File", "12.3. Refactoring to Improve Modularity and Error Handling", "12.4. Developing the Library’s Functionality with Test Driven Development", "12.5. Working with Environment Variables", "12.6. Writing Error Messages to Standard Error Instead of Standard Output"] },
    { title: "13. Functional Language Features: Iterators and Closures", chapters: ["13.1. Closures: Anonymous Functions that Capture Their Environment", "13.2. Processing a Series of Items with Iterators", "13.3. Improving Our I/O Project", "13.4. Comparing Performance: Loops vs. Iterators"] },
    { title: "14. More about Cargo and Crates.io", chapters: ["14.1. Customizing Builds with Release Profiles", "14.2. Publishing a Crate to Crates.io", "14.3. Cargo Workspaces", "14.4. Installing Binaries from Crates.io with cargo install", "14.5. Extending Cargo with Custom Commands"] },
    { title: "15. Smart Pointers", chapters: ["15.1. Using Box<T> to Point to Data on the Heap", "15.2. Treating Smart Pointers Like Regular References with the Deref Trait", "15.3. Running Code on Cleanup with the Drop Trait", "15.4. Rc<T>, the Reference Counted Smart Pointer", "15.5. RefCell<T> and the Interior Mutability Pattern", "15.6. Reference Cycles Can Leak Memory"] },
    { title: "16. Fearless Concurrency", chapters: ["16.1. Using Threads to Run Code Simultaneously", "16.2. Using Message Passing to Transfer Data Between Threads", "16.3. Shared-State Concurrency", "16.4. Extensible Concurrency with the Sync and Send Traits"] },
    { title: "17. Object Oriented Programming Features of Rust", chapters: ["17.1. Characteristics of Object-Oriented Languages", "17.2. Using Trait Objects That Allow for Values of Different Types", "17.3. Implementing an Object-Oriented Design Pattern"] },
    { title: "18. Patterns and Matching", chapters: ["18.1. All the Places Patterns Can Be Used", "18.2. Refutability: Whether a Pattern Might Fail to Match", "18.3. Pattern Syntax"] },
    { title: "19. Advanced Features", chapters: ["19.1. Unsafe Rust", "19.2. Advanced Traits", "19.3. Advanced Types", "19.4. Advanced Functions and Closures", "19.5. Macros"] },
    { title: "20. Final Project: Building a Multithreaded Web Server", chapters: ["20.1. Building a Single-Threaded Web Server", "20.2. Turning Our Single-Threaded Server into a Multithreaded Server", "20.3. Graceful Shutdown and Cleanup"] }
]

export function getChapterTitle(chapter: number, subchapter: number | undefined) {
    let c = titles[chapter]
    if (subchapter != undefined) {
        let s = c.chapters[subchapter]
        return s
    }
    return c.title
}