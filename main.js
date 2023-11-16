// (Internal FR - Source Code)

// sharedData is the storage area used for storing any data that more than 1 components needs
let sharedData = Vue.reactive({
    metaData: {         // Initialized in getMetaData()
    }
})


const Home = {
    template: '#home-template',
    data() {
        return {
            graphEle: null,
            showOrphanNodes: false,
            nodesView: null
        }
    },
    methods: {
        showOrphanNodesChanged(){
            // console.log(this.showOrphanNodes);
            this.nodesView.refresh();  
        },
        createNodesEdges() {
            // sharedData.bankEntities
            // sharedData.cryptoEntities
            // sharedData.crypto2Crypto
            // sharedData.bannk2Crypto
            // sharedData.crypto2Bannk
            let nodes = [];
            let edges = [];
            sharedData.bankEntities.forEach((v, i) => {
                // console.log({ n: 'bankEntities', i, v });
                nodes.push({ id: v.bank_id, label: v.bank_id, group: 1 });
            })
            sharedData.cryptoEntities.forEach((v, i) => {
                // console.log({ n: 'cryptoEntities', i, v, type: v['entity_type'] });
                nodes.push({ id: v.crypto_id, label: v.crypto_id, group: v.entity_type });
            })
            // console.log(nodes);
            sharedData.bannk2Crypto.forEach((v, i) => {
                // console.log({ n: 'bannk2Crypto', i, v });
                // ,relationship_type,
                edges.push({ from: v.bank_id, to: v.crypto_id, label: v.relationship_type });
            })
            sharedData.crypto2Crypto.forEach((v, i) => {
                //crypto_id_from,relationsihp_type,crypto_id_to
                // console.log({ n: 'crypto2Crypto', i, v });
                // ,relationship_type,
                edges.push({ from: v.crypto_id_from, to: v.crypto_id_to, label: v.relationsihp_type });
            })
            sharedData.crypto2Bannk.forEach((v, i) => {
                //crypto_id,relationship_type,bank_id
                // console.log({ n: 'crypto2Bannk', i, v });
                // ,relationship_type,
                edges.push({ from: v.crypto_id, to: v.bank_id, label: v.relationship_type });
            })


            return { nodes, edges }

        },
        createGraph() {
            let nodesEdges = this.createNodesEdges();
            let nodes = nodesEdges.nodes;
            let edges = nodesEdges.edges;

            // create a network
            var container = this.graphEle;

            // let edgesView = new vis.DataView(edges);

            var edgesDataSet = new vis.DataSet();
            edgesDataSet.add(edges);

            var nodesDataSet = new vis.DataSet();
            nodesDataSet.add(nodes);

            // var nodesView = new vis.DataView(nodesDataSet);
            var edgesView = new vis.DataView(edgesDataSet);
            // var edgesView = new vis.DataView(edgesDataSet, {
            //     filter: function (node) {
            //         return true;
            //     }
            // });

            // var nodesView = new vis.DataView(nodes, {
            //     filter: function (item) {
            //       return (item.group == 1);
            //     },
            //     fields: ['id', 'label']
            //   });

            let self = this;

            this.nodesView = new vis.DataView(nodesDataSet, {
                filter: (node) => {
                    let returnVal = true;
                    if(self.showOrphanNodes){
                        connEdges = edgesView.get({
                            filter: function (edge) {
                                return ((edge.to == node.id) || (edge.from == node.id));
                            }
                        });
                        returnVal = connEdges.length > 0;
                    }
                    return returnVal;
                }
            });

            var data = {
                nodes: this.nodesView,
                edges: edges,
            };


            var options = {
                // nodes: {
                //     shape: "dot",
                //     size: 16,
                // },
                physics: {
                    forceAtlas2Based: {
                        gravitationalConstant: -26,
                        centralGravity: 0.005,
                        springLength: 230,
                        springConstant: 0.18,
                    },
                    maxVelocity: 146,
                    solver: "forceAtlas2Based",
                    timestep: 0.35,
                    stabilization: { iterations: 150 },
                },


            };
            var network = new vis.Network(container, data, options);




        }
    },
    mounted() {
        this.graphEle = this.$refs['graph']
        // console.log(this.$refs);
        this.createGraph();
    },
    created() {
        console.log('Home created');
        this.createNodesEdges();
    }
}

const About = {
    template: '#about-template',
    data() {
        return {
        }
    },
    methods: {
    },
    created() {
        console.log('About created');
    }
}


/*
// Use Bar as a template to create a new component 
const Bar = {
    template: '#bar-template',
    data() {
        return {
        }
    },
    methods: {
    },
    created() {
        console.log('Bar created');
    }
}
*/


function initVue() {
    // Lets create Vue app, configure it to use Vuetify and Vue Router
    const { createApp } = Vue
    const { createVuetify } = Vuetify
    const vuetify = createVuetify();
    const app = createApp({
        el: '#app',
        created() {
            console.log('Vue is created.');
        }
    });

    // Create routes for the browser
    const routes = [
        { path: '/', component: Home },
        { path: '/about', component: About },
        // { path: '/bar', component: Bar }
    ]

    router = VueRouter.createRouter({
        history: VueRouter.createWebHashHistory(),
        routes
    })

    app.use(router);
    app.use(vuetify);
    // This is how to make sharedData available to all the components
    // app.config.globalProperties.sharedData = sharedData;
    app.mount('#app');
}


async function getFileData(fileName) {
    let csvTxt = await (await fetch('data/' + fileName)).text();
    return csvJSON(csvTxt);
}

async function getData() {
    console.log('Fetching data.');
    sharedData.bankEntities = await getFileData('bank_entity.csv');
    sharedData.cryptoEntities = await getFileData('crypto_entity.csv');
    sharedData.crypto2Crypto = await getFileData('crypto_to_crypto_relationship.csv');
    sharedData.bannk2Crypto = await getFileData('bank_to_crypto_relationship.csv');
    sharedData.crypto2Bannk = await getFileData('crypto_to_bank_relationship.csv');
    // console.log({ crypto2Bannk, bannk2Crypto, bankEntities, cryptoEntities, crypto2Crypto});
    // sharedData.bankEntities = bankEntities;
    // console.log(sharedData)
}


function csvJSON(csv) {
    var lines = csv.split("\n");
    var result = [];
    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step 
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {

        var obj = {};
        var currentline = lines[i].replace(/\r/, "").trim().split(",");
        if (currentline[0].length == 0) {
            continue;
        }

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentline[j];
        }

        result.push(obj);

    }

    return result;
}

(async () => {
    await getData();
    initVue();
})()