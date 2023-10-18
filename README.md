# referance

https://betterprogramming.pub/building-cross-platform-desktop-applications-with-tauri-part-ii-8d6ad1927093

in tauri.conf.json, in fs: {} there are scope key which defines where should our software data would be stored,
if we do "scope": ["$DOCUMENT/*"], it gonna only store data in documents directory,
other than documents/any_other_folder/ will give you and error
for that you need to do "scope": ["$DOCUMENT/**"], to able to save your files in documents directory and its subdirectories

reference : https://github.com/tauri-apps/tauri/issues/4130 (widersky comment)
