<main>
 <h2 id="graceful-shutdown-and-cleanup">
  <a class="header" href="#" onclick={() => {
    // @ts-ignore
    window.externallink("#graceful-shutdown-and-cleanup")
}}>
   Graceful Shutdown and Cleanup
  </a>
 </h2>
 <p>
  The code in Listing 20-20 is responding to requests asynchronously through the
use of a thread pool, as we intended. We get some warnings about the
  <code>
   workers
  </code>
  ,
  <code>
   id
  </code>
  , and
  <code>
   thread
  </code>
  fields that we’re not using in a direct way that reminds us
we’re not cleaning up anything. When we use the less elegant
  <kbd>
   ctrl
  </kbd>
  -
  <kbd>
   c
  </kbd>
  method to halt the main thread, all other threads
are stopped immediately as well, even if they’re in the middle of serving a
request.
 </p>
 <p>
  Next, then, we’ll implement the
  <code>
   Drop
  </code>
  trait to call
  <code>
   join
  </code>
  on each of the
threads in the pool so they can finish the requests they’re working on before
closing. Then we’ll implement a way to tell the threads they should stop
accepting new requests and shut down. To see this code in action, we’ll modify
our server to accept only two requests before gracefully shutting down its
thread pool.
 </p>
 <h3 id="implementing-the-drop-trait-on-threadpool">
  <a class="header" href="#" onclick={() => {
    // @ts-ignore
    window.externallink("#implementing-the-drop-trait-on-threadpool")
}}>
   Implementing the
   <code>
    Drop
   </code>
   Trait on
   <code>
    ThreadPool
   </code>
  </a>
 </h3>
 <p>
  Let’s start with implementing
  <code>
   Drop
  </code>
  on our thread pool. When the pool is
dropped, our threads should all join to make sure they finish their work.
Listing 20-22 shows a first attempt at a
  <code>
   Drop
  </code>
  implementation; this code won’t
quite work yet.
 </p>
 <p>
  <span class="filename">
   Filename: src/lib.rs
  </span>
 </p>
 <pre><code class="language-rust ignore does_not_compile"><span class="boring">use std::&#123;
</span><span class="boring">    sync::&#123;mpsc, Arc, Mutex&#125;,
</span><span class="boring">    thread,
</span><span class="boring">&#125;;
</span><span class="boring">
</span><span class="boring">pub struct ThreadPool &#123;
</span><span class="boring">    workers: Vec&lt;Worker&gt;,
</span><span class="boring">    sender: mpsc::Sender&lt;Job&gt;,
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">type Job = Box&lt;dyn FnOnce() + Send + 'static&gt;;
</span><span class="boring">
</span><span class="boring">impl ThreadPool &#123;
</span><span class="boring">    /// Create a new ThreadPool.
</span><span class="boring">    ///
</span><span class="boring">    /// The size is the number of threads in the pool.
</span><span class="boring">    ///
</span><span class="boring">    /// # Panics
</span><span class="boring">    ///
</span><span class="boring">    /// The `new` function will panic if the size is zero.
</span><span class="boring">    pub fn new(size: usize) -&gt; ThreadPool &#123;
</span><span class="boring">        assert!(size &gt; 0);
</span><span class="boring">
</span><span class="boring">        let (sender, receiver) = mpsc::channel();
</span><span class="boring">
</span><span class="boring">        let receiver = Arc::new(Mutex::new(receiver));
</span><span class="boring">
</span><span class="boring">        let mut workers = Vec::with_capacity(size);
</span><span class="boring">
</span><span class="boring">        for id in 0..size &#123;
</span><span class="boring">            workers.push(Worker::new(id, Arc::clone(&amp;receiver)));
</span><span class="boring">        &#125;
</span><span class="boring">
</span><span class="boring">        ThreadPool &#123; workers, sender &#125;
</span><span class="boring">    &#125;
</span><span class="boring">
</span><span class="boring">    pub fn execute&lt;F&gt;(&amp;self, f: F)
</span><span class="boring">    where
</span><span class="boring">        F: FnOnce() + Send + 'static,
</span><span class="boring">    &#123;
</span><span class="boring">        let job = Box::new(f);
</span><span class="boring">
</span><span class="boring">        self.sender.send(job).unwrap();
</span><span class="boring">    &#125;
</span><span class="boring">&#125;
</span><span class="boring">
</span>impl Drop for ThreadPool &#123;
    fn drop(&amp;mut self) &#123;
        for worker in &amp;mut self.workers &#123;
            println!("Shutting down worker &#123;&#125;", worker.id);

            worker.thread.join().unwrap();
        &#125;
    &#125;
&#125;
<span class="boring">
</span><span class="boring">struct Worker &#123;
</span><span class="boring">    id: usize,
</span><span class="boring">    thread: thread::JoinHandle&lt;()&gt;,
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">impl Worker &#123;
</span><span class="boring">    fn new(id: usize, receiver: Arc&lt;Mutex&lt;mpsc::Receiver&lt;Job&gt;&gt;&gt;) -&gt; Worker &#123;
</span><span class="boring">        let thread = thread::spawn(move || loop &#123;
</span><span class="boring">            let job = receiver.lock().unwrap().recv().unwrap();
</span><span class="boring">
</span><span class="boring">            println!("Worker &#123;id&#125; got a job; executing.");
</span><span class="boring">
</span><span class="boring">            job();
</span><span class="boring">        &#125;);
</span><span class="boring">
</span><span class="boring">        Worker &#123; id, thread &#125;
</span><span class="boring">    &#125;
</span><span class="boring">&#125;</span></code></pre>
 <p>
  <span class="caption">
   Listing 20-22: Joining each thread when the thread pool
goes out of scope
  </span>
 </p>
 <p>
  First, we loop through each of the thread pool
  <code>
   workers
  </code>
  . We use
  <code>
   &amp;mut
  </code>
  for
this because
  <code>
   self
  </code>
  is a mutable reference, and we also need to be able to
mutate
  <code>
   worker
  </code>
  . For each worker, we print a message saying that this
particular worker is shutting down, and then we call
  <code>
   join
  </code>
  on that worker’s
thread. If the call to
  <code>
   join
  </code>
  fails, we use
  <code>
   unwrap
  </code>
  to make Rust panic and go
into an ungraceful shutdown.
 </p>
 <p>
  Here is the error we get when we compile this code:
 </p>
 <pre><code class="language-console">$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0507]: cannot move out of `worker.thread` which is behind a mutable reference
  --&gt; src/lib.rs:52:13
   |
52 |             worker.thread.join().unwrap();
   |             ^^^^^^^^^^^^^ ------ `worker.thread` moved due to this method call
   |             |
   |             move occurs because `worker.thread` has type `JoinHandle&lt;()&gt;`, which does not implement the `Copy` trait
   |
note: `JoinHandle::&lt;T&gt;::join` takes ownership of the receiver `self`, which moves `worker.thread`
  --&gt; /rustc/eeb90cda1969383f56a2637cbd3037bdf598841c/library/std/src/thread/mod.rs:1778:17

For more information about this error, try `rustc --explain E0507`.
error: could not compile `hello` (lib) due to 1 previous error
</code></pre>
 <p>
  The error tells us we can’t call
  <code>
   join
  </code>
  because we only have a mutable borrow
of each
  <code>
   worker
  </code>
  and
  <code>
   join
  </code>
  takes ownership of its argument. To solve this
issue, we need to move the thread out of the
  <code>
   Worker
  </code>
  instance that owns
  <code>
   thread
  </code>
  so
  <code>
   join
  </code>
  can consume the thread. We did this in Listing 17-15: if
  <code>
   Worker
  </code>
  holds an
  <code>
   Option&lt;thread::JoinHandle&lt;()&gt;&gt;
  </code>
  instead, we can call the
  <code>
   take
  </code>
  method on the
  <code>
   Option
  </code>
  to move the value out of the
  <code>
   Some
  </code>
  variant and
leave a
  <code>
   None
  </code>
  variant in its place. In other words, a
  <code>
   Worker
  </code>
  that is running
will have a
  <code>
   Some
  </code>
  variant in
  <code>
   thread
  </code>
  , and when we want to clean up a
  <code>
   Worker
  </code>
  , we’ll replace
  <code>
   Some
  </code>
  with
  <code>
   None
  </code>
  so the
  <code>
   Worker
  </code>
  doesn’t have a
thread to run.
 </p>
 <p>
  So we know we want to update the definition of
  <code>
   Worker
  </code>
  like this:
 </p>
 <p>
  <span class="filename">
   Filename: src/lib.rs
  </span>
 </p>
 <pre><code class="language-rust ignore does_not_compile"><span class="boring">use std::&#123;
</span><span class="boring">    sync::&#123;mpsc, Arc, Mutex&#125;,
</span><span class="boring">    thread,
</span><span class="boring">&#125;;
</span><span class="boring">
</span><span class="boring">pub struct ThreadPool &#123;
</span><span class="boring">    workers: Vec&lt;Worker&gt;,
</span><span class="boring">    sender: mpsc::Sender&lt;Job&gt;,
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">type Job = Box&lt;dyn FnOnce() + Send + 'static&gt;;
</span><span class="boring">
</span><span class="boring">impl ThreadPool &#123;
</span><span class="boring">    /// Create a new ThreadPool.
</span><span class="boring">    ///
</span><span class="boring">    /// The size is the number of threads in the pool.
</span><span class="boring">    ///
</span><span class="boring">    /// # Panics
</span><span class="boring">    ///
</span><span class="boring">    /// The `new` function will panic if the size is zero.
</span><span class="boring">    pub fn new(size: usize) -&gt; ThreadPool &#123;
</span><span class="boring">        assert!(size &gt; 0);
</span><span class="boring">
</span><span class="boring">        let (sender, receiver) = mpsc::channel();
</span><span class="boring">
</span><span class="boring">        let receiver = Arc::new(Mutex::new(receiver));
</span><span class="boring">
</span><span class="boring">        let mut workers = Vec::with_capacity(size);
</span><span class="boring">
</span><span class="boring">        for id in 0..size &#123;
</span><span class="boring">            workers.push(Worker::new(id, Arc::clone(&amp;receiver)));
</span><span class="boring">        &#125;
</span><span class="boring">
</span><span class="boring">        ThreadPool &#123; workers, sender &#125;
</span><span class="boring">    &#125;
</span><span class="boring">
</span><span class="boring">    pub fn execute&lt;F&gt;(&amp;self, f: F)
</span><span class="boring">    where
</span><span class="boring">        F: FnOnce() + Send + 'static,
</span><span class="boring">    &#123;
</span><span class="boring">        let job = Box::new(f);
</span><span class="boring">
</span><span class="boring">        self.sender.send(job).unwrap();
</span><span class="boring">    &#125;
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">impl Drop for ThreadPool &#123;
</span><span class="boring">    fn drop(&amp;mut self) &#123;
</span><span class="boring">        for worker in &amp;mut self.workers &#123;
</span><span class="boring">            println!("Shutting down worker &#123;&#125;", worker.id);
</span><span class="boring">
</span><span class="boring">            worker.thread.join().unwrap();
</span><span class="boring">        &#125;
</span><span class="boring">    &#125;
</span><span class="boring">&#125;
</span><span class="boring">
</span>struct Worker &#123;
    id: usize,
    thread: Option&lt;thread::JoinHandle&lt;()&gt;&gt;,
&#125;
<span class="boring">
</span><span class="boring">impl Worker &#123;
</span><span class="boring">    fn new(id: usize, receiver: Arc&lt;Mutex&lt;mpsc::Receiver&lt;Job&gt;&gt;&gt;) -&gt; Worker &#123;
</span><span class="boring">        let thread = thread::spawn(move || loop &#123;
</span><span class="boring">            let job = receiver.lock().unwrap().recv().unwrap();
</span><span class="boring">
</span><span class="boring">            println!("Worker &#123;id&#125; got a job; executing.");
</span><span class="boring">
</span><span class="boring">            job();
</span><span class="boring">        &#125;);
</span><span class="boring">
</span><span class="boring">        Worker &#123; id, thread &#125;
</span><span class="boring">    &#125;
</span><span class="boring">&#125;</span></code></pre>
 <p>
  Now let’s lean on the compiler to find the other places that need to change.
Checking this code, we get two errors:
 </p>
 <pre><code class="language-console">$ cargo check
    Checking hello v0.1.0 (file:///projects/hello)
error[E0599]: no method named `join` found for enum `Option` in the current scope
  --&gt; src/lib.rs:52:27
   |
52 |             worker.thread.join().unwrap();
   |                           ^^^^ method not found in `Option&lt;JoinHandle&lt;()&gt;&gt;`
   |
note: the method `join` exists on the type `JoinHandle&lt;()&gt;`
  --&gt; /rustc/eeb90cda1969383f56a2637cbd3037bdf598841c/library/std/src/thread/mod.rs:1778:5
help: consider using `Option::expect` to unwrap the `JoinHandle&lt;()&gt;` value, panicking if the value is an `Option::None`
   |
52 |             worker.thread.expect("REASON").join().unwrap();
   |                          +++++++++++++++++

error[E0308]: mismatched types
  --&gt; src/lib.rs:72:22
   |
72 |         Worker &#123; id, thread &#125;
   |                      ^^^^^^ expected `Option&lt;JoinHandle&lt;()&gt;&gt;`, found `JoinHandle&lt;_&gt;`
   |
   = note: expected enum `Option&lt;JoinHandle&lt;()&gt;&gt;`
            found struct `JoinHandle&lt;_&gt;`
help: try wrapping the expression in `Some`
   |
72 |         Worker &#123; id, thread: Some(thread) &#125;
   |                      +++++++++++++      +

Some errors have detailed explanations: E0308, E0599.
For more information about an error, try `rustc --explain E0308`.
error: could not compile `hello` (lib) due to 2 previous errors
</code></pre>
 <p>
  Let’s address the second error, which points to the code at the end of
  <code>
   Worker::new
  </code>
  ; we need to wrap the
  <code>
   thread
  </code>
  value in
  <code>
   Some
  </code>
  when we create a
new
  <code>
   Worker
  </code>
  . Make the following changes to fix this error:
 </p>
 <p>
  <span class="filename">
   Filename: src/lib.rs
  </span>
 </p>
 <pre><code class="language-rust ignore does_not_compile"><span class="boring">use std::&#123;
</span><span class="boring">    sync::&#123;mpsc, Arc, Mutex&#125;,
</span><span class="boring">    thread,
</span><span class="boring">&#125;;
</span><span class="boring">
</span><span class="boring">pub struct ThreadPool &#123;
</span><span class="boring">    workers: Vec&lt;Worker&gt;,
</span><span class="boring">    sender: mpsc::Sender&lt;Job&gt;,
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">type Job = Box&lt;dyn FnOnce() + Send + 'static&gt;;
</span><span class="boring">
</span><span class="boring">impl ThreadPool &#123;
</span><span class="boring">    /// Create a new ThreadPool.
</span><span class="boring">    ///
</span><span class="boring">    /// The size is the number of threads in the pool.
</span><span class="boring">    ///
</span><span class="boring">    /// # Panics
</span><span class="boring">    ///
</span><span class="boring">    /// The `new` function will panic if the size is zero.
</span><span class="boring">    pub fn new(size: usize) -&gt; ThreadPool &#123;
</span><span class="boring">        assert!(size &gt; 0);
</span><span class="boring">
</span><span class="boring">        let (sender, receiver) = mpsc::channel();
</span><span class="boring">
</span><span class="boring">        let receiver = Arc::new(Mutex::new(receiver));
</span><span class="boring">
</span><span class="boring">        let mut workers = Vec::with_capacity(size);
</span><span class="boring">
</span><span class="boring">        for id in 0..size &#123;
</span><span class="boring">            workers.push(Worker::new(id, Arc::clone(&amp;receiver)));
</span><span class="boring">        &#125;
</span><span class="boring">
</span><span class="boring">        ThreadPool &#123; workers, sender &#125;
</span><span class="boring">    &#125;
</span><span class="boring">
</span><span class="boring">    pub fn execute&lt;F&gt;(&amp;self, f: F)
</span><span class="boring">    where
</span><span class="boring">        F: FnOnce() + Send + 'static,
</span><span class="boring">    &#123;
</span><span class="boring">        let job = Box::new(f);
</span><span class="boring">
</span><span class="boring">        self.sender.send(job).unwrap();
</span><span class="boring">    &#125;
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">impl Drop for ThreadPool &#123;
</span><span class="boring">    fn drop(&amp;mut self) &#123;
</span><span class="boring">        for worker in &amp;mut self.workers &#123;
</span><span class="boring">            println!("Shutting down worker &#123;&#125;", worker.id);
</span><span class="boring">
</span><span class="boring">            worker.thread.join().unwrap();
</span><span class="boring">        &#125;
</span><span class="boring">    &#125;
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">struct Worker &#123;
</span><span class="boring">    id: usize,
</span><span class="boring">    thread: Option&lt;thread::JoinHandle&lt;()&gt;&gt;,
</span><span class="boring">&#125;
</span><span class="boring">
</span>impl Worker &#123;
    fn new(id: usize, receiver: Arc&lt;Mutex&lt;mpsc::Receiver&lt;Job&gt;&gt;&gt;) -&gt; Worker &#123;
        // --snip--

<span class="boring">        let thread = thread::spawn(move || loop &#123;
</span><span class="boring">            let job = receiver.lock().unwrap().recv().unwrap();
</span><span class="boring">
</span><span class="boring">            println!("Worker &#123;id&#125; got a job; executing.");
</span><span class="boring">
</span><span class="boring">            job();
</span><span class="boring">        &#125;);
</span><span class="boring">
</span>        Worker &#123;
            id,
            thread: Some(thread),
        &#125;
    &#125;
&#125;</code></pre>
 <p>
  The first error is in our
  <code>
   Drop
  </code>
  implementation. We mentioned earlier that we
intended to call
  <code>
   take
  </code>
  on the
  <code>
   Option
  </code>
  value to move
  <code>
   thread
  </code>
  out of
  <code>
   worker
  </code>
  .
The following changes will do so:
 </p>
 <p>
  <span class="filename">
   Filename: src/lib.rs
  </span>
 </p>
 <pre><code class="language-rust ignore not_desired_behavior"><span class="boring">use std::&#123;
</span><span class="boring">    sync::&#123;mpsc, Arc, Mutex&#125;,
</span><span class="boring">    thread,
</span><span class="boring">&#125;;
</span><span class="boring">
</span><span class="boring">pub struct ThreadPool &#123;
</span><span class="boring">    workers: Vec&lt;Worker&gt;,
</span><span class="boring">    sender: mpsc::Sender&lt;Job&gt;,
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">type Job = Box&lt;dyn FnOnce() + Send + 'static&gt;;
</span><span class="boring">
</span><span class="boring">impl ThreadPool &#123;
</span><span class="boring">    /// Create a new ThreadPool.
</span><span class="boring">    ///
</span><span class="boring">    /// The size is the number of threads in the pool.
</span><span class="boring">    ///
</span><span class="boring">    /// # Panics
</span><span class="boring">    ///
</span><span class="boring">    /// The `new` function will panic if the size is zero.
</span><span class="boring">    pub fn new(size: usize) -&gt; ThreadPool &#123;
</span><span class="boring">        assert!(size &gt; 0);
</span><span class="boring">
</span><span class="boring">        let (sender, receiver) = mpsc::channel();
</span><span class="boring">
</span><span class="boring">        let receiver = Arc::new(Mutex::new(receiver));
</span><span class="boring">
</span><span class="boring">        let mut workers = Vec::with_capacity(size);
</span><span class="boring">
</span><span class="boring">        for id in 0..size &#123;
</span><span class="boring">            workers.push(Worker::new(id, Arc::clone(&amp;receiver)));
</span><span class="boring">        &#125;
</span><span class="boring">
</span><span class="boring">        ThreadPool &#123; workers, sender &#125;
</span><span class="boring">    &#125;
</span><span class="boring">
</span><span class="boring">    pub fn execute&lt;F&gt;(&amp;self, f: F)
</span><span class="boring">    where
</span><span class="boring">        F: FnOnce() + Send + 'static,
</span><span class="boring">    &#123;
</span><span class="boring">        let job = Box::new(f);
</span><span class="boring">
</span><span class="boring">        self.sender.send(job).unwrap();
</span><span class="boring">    &#125;
</span><span class="boring">&#125;
</span><span class="boring">
</span>impl Drop for ThreadPool &#123;
    fn drop(&amp;mut self) &#123;
        for worker in &amp;mut self.workers &#123;
            println!("Shutting down worker &#123;&#125;", worker.id);

            if let Some(thread) = worker.thread.take() &#123;
                thread.join().unwrap();
            &#125;
        &#125;
    &#125;
&#125;
<span class="boring">
</span><span class="boring">struct Worker &#123;
</span><span class="boring">    id: usize,
</span><span class="boring">    thread: Option&lt;thread::JoinHandle&lt;()&gt;&gt;,
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">impl Worker &#123;
</span><span class="boring">    fn new(id: usize, receiver: Arc&lt;Mutex&lt;mpsc::Receiver&lt;Job&gt;&gt;&gt;) -&gt; Worker &#123;
</span><span class="boring">        let thread = thread::spawn(move || loop &#123;
</span><span class="boring">            let job = receiver.lock().unwrap().recv().unwrap();
</span><span class="boring">
</span><span class="boring">            println!("Worker &#123;id&#125; got a job; executing.");
</span><span class="boring">
</span><span class="boring">            job();
</span><span class="boring">        &#125;);
</span><span class="boring">
</span><span class="boring">        Worker &#123;
</span><span class="boring">            id,
</span><span class="boring">            thread: Some(thread),
</span><span class="boring">        &#125;
</span><span class="boring">    &#125;
</span><span class="boring">&#125;</span></code></pre>
 <p>
  As discussed in Chapter 17, the
  <code>
   take
  </code>
  method on
  <code>
   Option
  </code>
  takes the
  <code>
   Some
  </code>
  variant out and leaves
  <code>
   None
  </code>
  in its place. We’re using
  <code>
   if let
  </code>
  to destructure
the
  <code>
   Some
  </code>
  and get the thread; then we call
  <code>
   join
  </code>
  on the thread. If a worker’s
thread is already
  <code>
   None
  </code>
  , we know that worker has already had its thread
cleaned up, so nothing happens in that case.
 </p>
 <h3 id="signaling-to-the-threads-to-stop-listening-for-jobs">
  <a class="header" href="#" onclick={() => {
    // @ts-ignore
    window.externallink("#signaling-to-the-threads-to-stop-listening-for-jobs")
}}>
   Signaling to the Threads to Stop Listening for Jobs
  </a>
 </h3>
 <p>
  With all the changes we’ve made, our code compiles without any warnings.
However, the bad news is this code doesn’t function the way we want it to yet.
The key is the logic in the closures run by the threads of the
  <code>
   Worker
  </code>
  instances: at the moment, we call
  <code>
   join
  </code>
  , but that won’t shut down the threads
because they
  <code>
   loop
  </code>
  forever looking for jobs. If we try to drop our
  <code>
   ThreadPool
  </code>
  with our current implementation of
  <code>
   drop
  </code>
  , the main thread will
block forever waiting for the first thread to finish.
 </p>
 <p>
  To fix this problem, we’ll need a change in the
  <code>
   ThreadPool
  </code>
  <code>
   drop
  </code>
  implementation and then a change in the
  <code>
   Worker
  </code>
  loop.
 </p>
 <p>
  First, we’ll change the
  <code>
   ThreadPool
  </code>
  <code>
   drop
  </code>
  implementation to explicitly drop
the
  <code>
   sender
  </code>
  before waiting for the threads to finish. Listing 20-23 shows the
changes to
  <code>
   ThreadPool
  </code>
  to explicitly drop
  <code>
   sender
  </code>
  . We use the same
  <code>
   Option
  </code>
  and
  <code>
   take
  </code>
  technique as we did with the thread to be able to move
  <code>
   sender
  </code>
  out
of
  <code>
   ThreadPool
  </code>
  :
 </p>
 <p>
  <span class="filename">
   Filename: src/lib.rs
  </span>
 </p>
 <pre><code class="language-rust noplayground not_desired_behavior"><span class="boring">use std::&#123;
</span><span class="boring">    sync::&#123;mpsc, Arc, Mutex&#125;,
</span><span class="boring">    thread,
</span><span class="boring">&#125;;
</span><span class="boring">
</span>pub struct ThreadPool &#123;
    workers: Vec&lt;Worker&gt;,
    sender: Option&lt;mpsc::Sender&lt;Job&gt;&gt;,
&#125;
// --snip--
<span class="boring">
</span><span class="boring">type Job = Box&lt;dyn FnOnce() + Send + 'static&gt;;
</span><span class="boring">
</span>impl ThreadPool &#123;
<span class="boring">    /// Create a new ThreadPool.
</span><span class="boring">    ///
</span><span class="boring">    /// The size is the number of threads in the pool.
</span><span class="boring">    ///
</span><span class="boring">    /// # Panics
</span><span class="boring">    ///
</span><span class="boring">    /// The `new` function will panic if the size is zero.
</span>    pub fn new(size: usize) -&gt; ThreadPool &#123;
        // --snip--

<span class="boring">        assert!(size &gt; 0);
</span><span class="boring">
</span><span class="boring">        let (sender, receiver) = mpsc::channel();
</span><span class="boring">
</span><span class="boring">        let receiver = Arc::new(Mutex::new(receiver));
</span><span class="boring">
</span><span class="boring">        let mut workers = Vec::with_capacity(size);
</span><span class="boring">
</span><span class="boring">        for id in 0..size &#123;
</span><span class="boring">            workers.push(Worker::new(id, Arc::clone(&amp;receiver)));
</span><span class="boring">        &#125;
</span><span class="boring">
</span>        ThreadPool &#123;
            workers,
            sender: Some(sender),
        &#125;
    &#125;

    pub fn execute&lt;F&gt;(&amp;self, f: F)
    where
        F: FnOnce() + Send + 'static,
    &#123;
        let job = Box::new(f);

        self.sender.as_ref().unwrap().send(job).unwrap();
    &#125;
&#125;

impl Drop for ThreadPool &#123;
    fn drop(&amp;mut self) &#123;
        drop(self.sender.take());

        for worker in &amp;mut self.workers &#123;
            println!("Shutting down worker &#123;&#125;", worker.id);

            if let Some(thread) = worker.thread.take() &#123;
                thread.join().unwrap();
            &#125;
        &#125;
    &#125;
&#125;
<span class="boring">
</span><span class="boring">struct Worker &#123;
</span><span class="boring">    id: usize,
</span><span class="boring">    thread: Option&lt;thread::JoinHandle&lt;()&gt;&gt;,
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">impl Worker &#123;
</span><span class="boring">    fn new(id: usize, receiver: Arc&lt;Mutex&lt;mpsc::Receiver&lt;Job&gt;&gt;&gt;) -&gt; Worker &#123;
</span><span class="boring">        let thread = thread::spawn(move || loop &#123;
</span><span class="boring">            let job = receiver.lock().unwrap().recv().unwrap();
</span><span class="boring">
</span><span class="boring">            println!("Worker &#123;id&#125; got a job; executing.");
</span><span class="boring">
</span><span class="boring">            job();
</span><span class="boring">        &#125;);
</span><span class="boring">
</span><span class="boring">        Worker &#123;
</span><span class="boring">            id,
</span><span class="boring">            thread: Some(thread),
</span><span class="boring">        &#125;
</span><span class="boring">    &#125;
</span><span class="boring">&#125;</span></code></pre>
 <p>
  <span class="caption">
   Listing 20-23: Explicitly drop
   <code>
    sender
   </code>
   before joining
the worker threads
  </span>
 </p>
 <p>
  Dropping
  <code>
   sender
  </code>
  closes the channel, which indicates no more messages will be
sent. When that happens, all the calls to
  <code>
   recv
  </code>
  that the workers do in the
infinite loop will return an error. In Listing 20-24, we change the
  <code>
   Worker
  </code>
  loop to gracefully exit the loop in that case, which means the threads will
finish when the
  <code>
   ThreadPool
  </code>
  <code>
   drop
  </code>
  implementation calls
  <code>
   join
  </code>
  on them.
 </p>
 <p>
  <span class="filename">
   Filename: src/lib.rs
  </span>
 </p>
 <pre><code class="language-rust noplayground"><span class="boring">use std::&#123;
</span><span class="boring">    sync::&#123;mpsc, Arc, Mutex&#125;,
</span><span class="boring">    thread,
</span><span class="boring">&#125;;
</span><span class="boring">
</span><span class="boring">pub struct ThreadPool &#123;
</span><span class="boring">    workers: Vec&lt;Worker&gt;,
</span><span class="boring">    sender: Option&lt;mpsc::Sender&lt;Job&gt;&gt;,
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">type Job = Box&lt;dyn FnOnce() + Send + 'static&gt;;
</span><span class="boring">
</span><span class="boring">impl ThreadPool &#123;
</span><span class="boring">    /// Create a new ThreadPool.
</span><span class="boring">    ///
</span><span class="boring">    /// The size is the number of threads in the pool.
</span><span class="boring">    ///
</span><span class="boring">    /// # Panics
</span><span class="boring">    ///
</span><span class="boring">    /// The `new` function will panic if the size is zero.
</span><span class="boring">    pub fn new(size: usize) -&gt; ThreadPool &#123;
</span><span class="boring">        assert!(size &gt; 0);
</span><span class="boring">
</span><span class="boring">        let (sender, receiver) = mpsc::channel();
</span><span class="boring">
</span><span class="boring">        let receiver = Arc::new(Mutex::new(receiver));
</span><span class="boring">
</span><span class="boring">        let mut workers = Vec::with_capacity(size);
</span><span class="boring">
</span><span class="boring">        for id in 0..size &#123;
</span><span class="boring">            workers.push(Worker::new(id, Arc::clone(&amp;receiver)));
</span><span class="boring">        &#125;
</span><span class="boring">
</span><span class="boring">        ThreadPool &#123;
</span><span class="boring">            workers,
</span><span class="boring">            sender: Some(sender),
</span><span class="boring">        &#125;
</span><span class="boring">    &#125;
</span><span class="boring">
</span><span class="boring">    pub fn execute&lt;F&gt;(&amp;self, f: F)
</span><span class="boring">    where
</span><span class="boring">        F: FnOnce() + Send + 'static,
</span><span class="boring">    &#123;
</span><span class="boring">        let job = Box::new(f);
</span><span class="boring">
</span><span class="boring">        self.sender.as_ref().unwrap().send(job).unwrap();
</span><span class="boring">    &#125;
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">impl Drop for ThreadPool &#123;
</span><span class="boring">    fn drop(&amp;mut self) &#123;
</span><span class="boring">        drop(self.sender.take());
</span><span class="boring">
</span><span class="boring">        for worker in &amp;mut self.workers &#123;
</span><span class="boring">            println!("Shutting down worker &#123;&#125;", worker.id);
</span><span class="boring">
</span><span class="boring">            if let Some(thread) = worker.thread.take() &#123;
</span><span class="boring">                thread.join().unwrap();
</span><span class="boring">            &#125;
</span><span class="boring">        &#125;
</span><span class="boring">    &#125;
</span><span class="boring">&#125;
</span><span class="boring">
</span><span class="boring">struct Worker &#123;
</span><span class="boring">    id: usize,
</span><span class="boring">    thread: Option&lt;thread::JoinHandle&lt;()&gt;&gt;,
</span><span class="boring">&#125;
</span><span class="boring">
</span>impl Worker &#123;
    fn new(id: usize, receiver: Arc&lt;Mutex&lt;mpsc::Receiver&lt;Job&gt;&gt;&gt;) -&gt; Worker &#123;
        let thread = thread::spawn(move || loop &#123;
            let message = receiver.lock().unwrap().recv();

            match message &#123;
                Ok(job) =&gt; &#123;
                    println!("Worker &#123;id&#125; got a job; executing.");

                    job();
                &#125;
                Err(_) =&gt; &#123;
                    println!("Worker &#123;id&#125; disconnected; shutting down.");
                    break;
                &#125;
            &#125;
        &#125;);

        Worker &#123;
            id,
            thread: Some(thread),
        &#125;
    &#125;
&#125;</code></pre>
 <p>
  <span class="caption">
   Listing 20-24: Explicitly break out of the loop when
   <code>
    recv
   </code>
   returns an error
  </span>
 </p>
 <p>
  To see this code in action, let’s modify
  <code>
   main
  </code>
  to accept only two requests
before gracefully shutting down the server, as shown in Listing 20-25.
 </p>
 <p>
  <span class="filename">
   Filename: src/main.rs
  </span>
 </p>
 <pre><code class="language-rust ignore"><span class="boring">use hello::ThreadPool;
</span><span class="boring">use std::&#123;
</span><span class="boring">    fs,
</span><span class="boring">    io::&#123;prelude::*, BufReader&#125;,
</span><span class="boring">    net::&#123;TcpListener, TcpStream&#125;,
</span><span class="boring">    thread,
</span><span class="boring">    time::Duration,
</span><span class="boring">&#125;;
</span><span class="boring">
</span>fn main() &#123;
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming().take(2) &#123;
        let stream = stream.unwrap();

        pool.execute(|| &#123;
            handle_connection(stream);
        &#125;);
    &#125;

    println!("Shutting down.");
&#125;
<span class="boring">
</span><span class="boring">fn handle_connection(mut stream: TcpStream) &#123;
</span><span class="boring">    let buf_reader = BufReader::new(&amp;stream);
</span><span class="boring">    let request_line = buf_reader.lines().next().unwrap().unwrap();
</span><span class="boring">
</span><span class="boring">    let (status_line, filename) = match &amp;request_line[..] &#123;
</span><span class="boring">        "GET / HTTP/1.1" =&gt; ("HTTP/1.1 200 OK", "hello.html"),
</span><span class="boring">        "GET /sleep HTTP/1.1" =&gt; &#123;
</span><span class="boring">            thread::sleep(Duration::from_secs(5));
</span><span class="boring">            ("HTTP/1.1 200 OK", "hello.html")
</span><span class="boring">        &#125;
</span><span class="boring">        _ =&gt; ("HTTP/1.1 404 NOT FOUND", "404.html"),
</span><span class="boring">    &#125;;
</span><span class="boring">
</span><span class="boring">    let contents = fs::read_to_string(filename).unwrap();
</span><span class="boring">    let length = contents.len();
</span><span class="boring">
</span><span class="boring">    let response =
</span><span class="boring">        format!("&#123;status_line&#125;\r\nContent-Length: &#123;length&#125;\r\n\r\n&#123;contents&#125;");
</span><span class="boring">
</span><span class="boring">    stream.write_all(response.as_bytes()).unwrap();
</span><span class="boring">&#125;</span></code></pre>
 <p>
  <span class="caption">
   Listing 20-25: Shut down the server after serving two
requests by exiting the loop
  </span>
 </p>
 <p>
  You wouldn’t want a real-world web server to shut down after serving only two
requests. This code just demonstrates that the graceful shutdown and cleanup is
in working order.
 </p>
 <p>
  The
  <code>
   take
  </code>
  method is defined in the
  <code>
   Iterator
  </code>
  trait and limits the iteration
to the first two items at most. The
  <code>
   ThreadPool
  </code>
  will go out of scope at the
end of
  <code>
   main
  </code>
  , and the
  <code>
   drop
  </code>
  implementation will run.
 </p>
 <p>
  Start the server with
  <code>
   cargo run
  </code>
  , and make three requests. The third request
should error, and in your terminal you should see output similar to this:
 </p>
 <!-- manual-regeneration
cd listings/ch20-web-server/listing-20-25
cargo run
curl http://127.0.0.1:7878
curl http://127.0.0.1:7878
curl http://127.0.0.1:7878
third request will error because server will have shut down
copy output below
Can't automate because the output depends on making requests
-->
 <pre><code class="language-console">$ cargo run
   Compiling hello v0.1.0 (file:///projects/hello)
    Finished dev [unoptimized + debuginfo] target(s) in 1.0s
     Running `target/debug/hello`
Worker 0 got a job; executing.
Shutting down.
Shutting down worker 0
Worker 3 got a job; executing.
Worker 1 disconnected; shutting down.
Worker 2 disconnected; shutting down.
Worker 3 disconnected; shutting down.
Worker 0 disconnected; shutting down.
Shutting down worker 1
Shutting down worker 2
Shutting down worker 3
</code></pre>
 <p>
  You might see a different ordering of workers and messages printed. We can see
how this code works from the messages: workers 0 and 3 got the first two
requests. The server stopped accepting connections after the second connection,
and the
  <code>
   Drop
  </code>
  implementation on
  <code>
   ThreadPool
  </code>
  starts executing before worker 3
even starts its job. Dropping the
  <code>
   sender
  </code>
  disconnects all the workers and
tells them to shut down. The workers each print a message when they disconnect,
and then the thread pool calls
  <code>
   join
  </code>
  to wait for each worker thread to finish.
 </p>
 <p>
  Notice one interesting aspect of this particular execution: the
  <code>
   ThreadPool
  </code>
  dropped the
  <code>
   sender
  </code>
  , and before any worker received an error, we tried to join
worker 0. Worker 0 had not yet gotten an error from
  <code>
   recv
  </code>
  , so the main thread
blocked waiting for worker 0 to finish. In the meantime, worker 3 received a
job and then all threads received an error. When worker 0 finished, the main
thread waited for the rest of the workers to finish. At that point, they had
all exited their loops and stopped.
 </p>
 <p>
  Congrats! We’ve now completed our project; we have a basic web server that uses
a thread pool to respond asynchronously. We’re able to perform a graceful
shutdown of the server, which cleans up all the threads in the pool.
 </p>
 <p>
  Here’s the full code for reference:
 </p>
 <p>
  <span class="filename">
   Filename: src/main.rs
  </span>
 </p>
 <pre><code class="language-rust ignore">use hello::ThreadPool;
use std::&#123;
    fs,
    io::&#123;prelude::*, BufReader&#125;,
    net::&#123;TcpListener, TcpStream&#125;,
    thread,
    time::Duration,
&#125;;

fn main() &#123;
    let listener = TcpListener::bind("127.0.0.1:7878").unwrap();
    let pool = ThreadPool::new(4);

    for stream in listener.incoming().take(2) &#123;
        let stream = stream.unwrap();

        pool.execute(|| &#123;
            handle_connection(stream);
        &#125;);
    &#125;

    println!("Shutting down.");
&#125;

fn handle_connection(mut stream: TcpStream) &#123;
    let buf_reader = BufReader::new(&amp;stream);
    let request_line = buf_reader.lines().next().unwrap().unwrap();

    let (status_line, filename) = match &amp;request_line[..] &#123;
        "GET / HTTP/1.1" =&gt; ("HTTP/1.1 200 OK", "hello.html"),
        "GET /sleep HTTP/1.1" =&gt; &#123;
            thread::sleep(Duration::from_secs(5));
            ("HTTP/1.1 200 OK", "hello.html")
        &#125;
        _ =&gt; ("HTTP/1.1 404 NOT FOUND", "404.html"),
    &#125;;

    let contents = fs::read_to_string(filename).unwrap();
    let length = contents.len();

    let response =
        format!("&#123;status_line&#125;\r\nContent-Length: &#123;length&#125;\r\n\r\n&#123;contents&#125;");

    stream.write_all(response.as_bytes()).unwrap();
&#125;</code></pre>
 <p>
  <span class="filename">
   Filename: src/lib.rs
  </span>
 </p>
 <pre><code class="language-rust noplayground">use std::&#123;
    sync::&#123;mpsc, Arc, Mutex&#125;,
    thread,
&#125;;

pub struct ThreadPool &#123;
    workers: Vec&lt;Worker&gt;,
    sender: Option&lt;mpsc::Sender&lt;Job&gt;&gt;,
&#125;

type Job = Box&lt;dyn FnOnce() + Send + 'static&gt;;

impl ThreadPool &#123;
    /// Create a new ThreadPool.
    ///
    /// The size is the number of threads in the pool.
    ///
    /// # Panics
    ///
    /// The `new` function will panic if the size is zero.
    pub fn new(size: usize) -&gt; ThreadPool &#123;
        assert!(size &gt; 0);

        let (sender, receiver) = mpsc::channel();

        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size &#123;
            workers.push(Worker::new(id, Arc::clone(&amp;receiver)));
        &#125;

        ThreadPool &#123;
            workers,
            sender: Some(sender),
        &#125;
    &#125;

    pub fn execute&lt;F&gt;(&amp;self, f: F)
    where
        F: FnOnce() + Send + 'static,
    &#123;
        let job = Box::new(f);

        self.sender.as_ref().unwrap().send(job).unwrap();
    &#125;
&#125;

impl Drop for ThreadPool &#123;
    fn drop(&amp;mut self) &#123;
        drop(self.sender.take());

        for worker in &amp;mut self.workers &#123;
            println!("Shutting down worker &#123;&#125;", worker.id);

            if let Some(thread) = worker.thread.take() &#123;
                thread.join().unwrap();
            &#125;
        &#125;
    &#125;
&#125;

struct Worker &#123;
    id: usize,
    thread: Option&lt;thread::JoinHandle&lt;()&gt;&gt;,
&#125;

impl Worker &#123;
    fn new(id: usize, receiver: Arc&lt;Mutex&lt;mpsc::Receiver&lt;Job&gt;&gt;&gt;) -&gt; Worker &#123;
        let thread = thread::spawn(move || loop &#123;
            let message = receiver.lock().unwrap().recv();

            match message &#123;
                Ok(job) =&gt; &#123;
                    println!("Worker &#123;id&#125; got a job; executing.");

                    job();
                &#125;
                Err(_) =&gt; &#123;
                    println!("Worker &#123;id&#125; disconnected; shutting down.");
                    break;
                &#125;
            &#125;
        &#125;);

        Worker &#123;
            id,
            thread: Some(thread),
        &#125;
    &#125;
&#125;</code></pre>
 <p>
  We could do more here! If you want to continue enhancing this project, here are
some ideas:
 </p>
 <ul>
  <li>
   Add more documentation to
   <code>
    ThreadPool
   </code>
   and its public methods.
  </li>
  <li>
   Add tests of the library’s functionality.
  </li>
  <li>
   Change calls to
   <code>
    unwrap
   </code>
   to more robust error handling.
  </li>
  <li>
   Use
   <code>
    ThreadPool
   </code>
   to perform some task other than serving web requests.
  </li>
  <li>
   Find a thread pool crate on
   <a href="#" onclick={() => {
    // @ts-ignore
    window.externallink("https://crates.io/")
}}>
    crates.io
   </a>
   and implement a
similar web server using the crate instead. Then compare its API and
robustness to the thread pool we implemented.
  </li>
 </ul>
 <h2 id="summary">
  <a class="header" href="#" onclick={() => {
    // @ts-ignore
    window.externallink("#summary")
}}>
   Summary
  </a>
 </h2>
 <p>
  Well done! You’ve made it to the end of the book! We want to thank you for
joining us on this tour of Rust. You’re now ready to implement your own Rust
projects and help with other peoples’ projects. Keep in mind that there is a
welcoming community of other Rustaceans who would love to help you with any
challenges you encounter on your Rust journey.
 </p>
</main>
