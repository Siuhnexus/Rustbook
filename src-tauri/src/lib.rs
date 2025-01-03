use std::{fs, io::ErrorKind, sync::{mpsc::{self, Sender}, Mutex}, thread, time::{Duration, SystemTime, UNIX_EPOCH}};

use tauri::State;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
struct Chapter {
    chapters: Vec<Chapter>,
    progress: f32
}

#[derive(Serialize, Deserialize, Clone)]
struct Progress {
    chapters: Vec<Chapter>
}

#[derive(Serialize, Deserialize, Clone)]
struct ProgressUpdate {
    chapter: usize,
    subchapter: Option<usize>,
    newprogress: f32
}

#[tauri::command]
fn check_data(state: State<'_, Mutex<Option<Progress>>>) -> bool {
    return state.lock().unwrap().is_some()
}

fn create_subchapter() -> Chapter {
    Chapter{ chapters: vec![], progress: 0.0 }
}
fn create_chapter(subchapter_len: usize) -> Chapter {
    let mut chapters = Vec::new();
    for _ in 0..subchapter_len {
        chapters.push(create_subchapter());
    }
    Chapter { chapters, progress: 0.0 }
}
fn create_progress() -> Progress {
    let mut chapter_vec = Vec::new();
    for i in [0, 0, 0, 3, 0, 5, 3, 3, 3, 5, 3, 3, 3, 3, 6, 4, 5, 6, 4, 3, 3, 5, 3] {
        chapter_vec.push(create_chapter(i));
    }
    Progress { chapters: chapter_vec }
}
#[tauri::command]
fn get_progress(progress: State<'_, Mutex<Option<Progress>>>) -> Progress {
    let mut v = progress.lock().unwrap();
    match &*v {
        Some(v) => v.clone(),
        None => {
            let created = create_progress();
            *v = Some(created.clone());
            created
        },
    }
}

fn set_progress_on_path(progress: &mut Progress, update: ProgressUpdate) -> bool {
    match progress.chapters.get_mut(update.chapter) {
        None => false,
        Some(c) => {
            match update.subchapter {
                Some(sci) => {
                    match c.chapters.get_mut(sci) {
                        None => false,
                        Some(sc) => {
                            sc.progress = update.newprogress;
                            true
                        }
                    }
                },
                None => {
                    c.progress = update.newprogress;
                    true
                }
            }
        }
    }
}
#[tauri::command]
fn set_progress(update: ProgressUpdate, progress: State<'_, Mutex<Option<Progress>>>, last_update: State<'_, Mutex<Option<u128>>>, cancel: State<'_, Mutex<Sender<()>>>) -> bool {
    let mut v = progress.lock().unwrap();
    match &mut *v {
        Some(v) => {
            let result = set_progress_on_path(v, update);
            if result {
                cancel.lock().unwrap().send(()).unwrap_or(());
                *last_update.lock().unwrap() = Some(SystemTime::now().duration_since(UNIX_EPOCH).expect("System time is faulty").as_millis());
                let (sender, receiver) = mpsc::channel::<()>();
                *cancel.lock().unwrap() = sender;
                let savable = v.clone();
                thread::spawn(move || {
                    match receiver.recv_timeout(Duration::from_secs(5)) {
                        Ok(_) => {},
                        Err(_) => {
                            fs::write("saves/progress.json", serde_json::to_string(&savable).expect("Faulty data")).unwrap_or(());
                        }
                    }
                });
            }
            result
        },
        None => false,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    fs::create_dir("saves").unwrap_or(());
    let progress_from_file = match fs::read_to_string("saves/progress.json") {
        Ok(data) => { Some(serde_json::from_str(data.as_str()).expect("Faulty data")) },
        Err(e) => {
            if e.kind() == ErrorKind::NotFound {
                Some(create_progress())
            }
            else {    
                None
            }
        }
    };
    let progress_data: Mutex<Option<Progress>> = Mutex::new(progress_from_file.clone());
    let last_update: Mutex<Option<u128>> = Mutex::new(None);
    let cancel: Mutex<Sender<()>> = Mutex::new(mpsc::channel::<()>().0);
    tauri::Builder::default()
        .manage(progress_data).manage(last_update).manage(cancel)
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![check_data, get_progress, set_progress])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}