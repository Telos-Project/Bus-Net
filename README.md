# Bus Net

## 1 - Abstract

***You're Goin' Surfin' on the Bus Net!***

A bus net is an amorphous, graph data structure, where nodes, called bus modules, take the form of
objects with a "query" function, said function taking an optional string argument, and returning
either a string response or a null value. Bus modules may also be assigned string tags for
identification and classification. Properties may be assigned to the connections in bus nets to
make them far more versatile than traditional bus architectures.

In this manner, they form a scalable and modular intranet of services within an otherwise
monolithic environment. As such, they can scale seamlessly under scope creep and pivots, while
dynamically accomodating plugins at compile or run time.

Applications which may benefit from this include game engines and language interpreters, among
others.

## 2 - Contents

### 2.1 - Bus Traversals

Connections between bus modules are unidirectional, and may either be public or private. During
traversal, the process may traverse any public conncection, but may only traverse a private
connection if the traversal began at the source node of said connection.

A traversal originating from a given bus module and following all of the aforementioned rules
should continue until it finds no more bus modules it may traverse, and compile said modules into
a list.

Said list may either be used for a system query, where a single string message is passed to each
bus module found, and where a list of each of the resulting responses are returned.

Said list may also be used to filter specific bus modules from the system by their tags.

### 2.2 - Conventions

#### 2.2.1 - Access and Anchor

The default use case of a bus net is to have a single bus net be globally available across the
application, and to have a single bus module within the bus net by default, called the bus anchor,
which any new bus module may connect to.

#### 2.2.2 - Generalized Bus Net

A generalized bus net is one where nodes may be values other than bus modules, and connection
properties may be values other than private or public, allowing for more complex emergent behavior.