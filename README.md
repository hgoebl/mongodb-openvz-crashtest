# mongodb-openvz-crashtest

Stress test for MongoDB running under OpenVZ.

If you want to run MongoDB on a VPS (virtual private server), you might encounter frightening
messages when looking in the log-file or when opening the shell:

```text
[initandlisten]
[initandlisten] ** WARNING: You are running in OpenVZ. This is known to be broken!!!
[initandlisten]
```

There are many sources in the web, some of them are out-dated, others not. To be sure whether you
really run into problems, it is possible to test this with this little node.js program.

**No guarantee that a negative test means that you won't have any problems!**

# Installation

Either clone this git repo or install with `npm install mongodb-openvz-crashtest`.

# Run

You can change the configuration by editing `config.json`. In my example I used 2MB as the document
size and 4K documents to create at least 8GB of volume, as my VPS has 8GB of virtual memory.

In the directory of the installed package, run `node .`

# More Information

Find more infos and links on my [wiki page](http://www.wellcrafted.de/wiki/mongodb-openvz-crashtest).

# JAVA implementation

I already had Node.js installed on my VPS. Didn't want to install Java and Maven and neither wanted
to run the test through ssh-tunnel. If you prefer to use a Java program for this, have a look at
[zlowred / mongodb-openvz-test](https://github.com/zlowred/mongodb-openvz-test).

# License

MIT
