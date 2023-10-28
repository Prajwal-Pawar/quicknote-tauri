# referance

https://betterprogramming.pub/building-cross-platform-desktop-applications-with-tauri-part-ii-8d6ad1927093

in tauri.conf.json, in fs: {} there are scope key which defines where should our software data would be stored,
if we do "scope": ["$DOCUMENT/*"], it gonna only store data in documents directory,
other than documents/any_other_folder/ will give you and error
for that you need to do "scope": ["$DOCUMENT/**"], to able to save your files in documents directory and its subdirectories

reference : https://github.com/tauri-apps/tauri/issues/4130 (widersky comment)

sqlite db reference: https://github.com/tauri-apps/tauri-plugin-sql

sqlite is The project is in fact open-source, just not open-contribute. Where as MariaDB/MySQL requires a server to run, SQLite is server-less. It's self-contained, also referred to as an embedded database.
SQLite is a single user database. It does not try to be anything else. It is just a single file on your disk and all the logic is a small library included in a program.
If you simply need a small, fast database which is a throw away project, SQLite is probably the best option for you. It is very good single user database system.

sqlite database viewer: https://inloop.github.io/sqlite-viewer/

tauri just generats a binary/build for your operating system. if you are on linux, it will build a bundle for linux.

for building app cross platform
https://www.smashingmagazine.com/2020/07/tiny-desktop-apps-tauri-vuejs/
