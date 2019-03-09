// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.toWei(1, "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmitted = false
        
        // Watch the emitted event Harvested()
        var event = supplyChain.Harvested()
        await event.watch((err, res) => {
            eventEmitted = true            
        })

        // Mark an item as Harvested by calling function harvestItem()
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
        
        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })    

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        // Add farmer
        await supplyChain.addFarmer(originFarmerID);
        
        // Declare and Initialize a variable for event
        var eventEmmitted = false
        // Watch the emitted event Processed()
        var event = supplyChain.Processed()
        await event.watch((err, res) => {
            eventEmitted = true            
        })

        // Mark an item as Processed by calling function processtItem()
        await supplyChain.processItem(upc, {from: originFarmerID, gasPrice: 0});
        // Verify that processItem can't be called by distributor

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        //const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmmitted = false
        // Watch the emitted event Packed()
        var event = supplyChain.Packed()
        await event.watch((err, res) => {
            eventEmitted = true            
        })

        // Mark an item as Packed by calling function packItem()
        await supplyChain.packItem(upc, {from: originFarmerID, gasPrice: 0});

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        //const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')

    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmmitted = false
        // Watch the emitted event ForSale()
        var event = supplyChain.ForSale()
        await event.watch((err, res) => {
            eventEmitted = true            
        })

        // Mark an item as ForSale by calling function sellItem()
        await supplyChain.sellItem(upc, productPrice, {from: originFarmerID, gasPrice: 0})

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        //const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State')        
        assert.equal(eventEmitted, true, 'Invalid event emitted')
          
    })

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        // Add Distributor account
        await supplyChain.addDistributor(distributorID);
        // Declare and Initialize a variable for event
        var eventEmmitted = false
        // Watch the emitted event Sold()
        var event = supplyChain.Sold()
        await event.watch((err, res) => {
            eventEmitted = true
        })

        // Mark an item as Sold by calling function buyItem()
        const farmerBeforeTransaction = await web3.eth.getBalance(originFarmerID)
        const DistributorBeforeTransaction = await web3.eth.getBalance(distributorID)

        await supplyChain.buyItem(upc, {from: distributorID, value:productPrice, gasPrice: 100, gas : 100000})

        const farmerAfterTransaction = await web3.eth.getBalance(originFarmerID)
        const DistributorAfterTransaction = await web3.eth.getBalance(distributorID)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[2], distributorID, 'Error : Invalid owner ID');
        assert.equal(resultBufferOne[3], originFarmerID, 'Error : Invalid origin Farmer ID');
        assert.equal(resultBufferTwo[6], distributorID, 'Error: Invalid distributor ID')
        assert.equal(resultBufferTwo[4], productPrice, 'Error: Invalid item State')
        assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State')        
        assert.equal(eventEmitted, true, 'Invalid event emitted')
        // Verify balance in both accounts
        assert.equal(farmerAfterTransaction-farmerBeforeTransaction, productPrice, "Invalid farmer balance")
        assert.equal(DistributorBeforeTransaction-DistributorAfterTransaction, productPrice, 'Invalid distributor balance');
        
    })

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var eventEmmitted = false
        // Watch the emitted event Shipped()
        var event = supplyChain.Shipped()
        await event.watch((err, res) => {
            eventEmitted = true            
        })

        // Mark an item as Shiped by calling function shipItem()
        var ret = await supplyChain.shipItem(upc);
        // TODO investigate
        console.log('Return value : ' + ret);

         // Retrieve the just now saved item from blockchain by calling function fetchItem()
         //const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
         const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
 
         // Verify the result set         
         assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State')        
         assert.equal(eventEmitted, true, 'Invalid event emitted')
              
    })

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()
        // Add Retailer account TODO it is failing somehow
        await supplyChain.addRetailer(retailerID);
        // Declare and Initialize a variable for event
        var eventEmmitted = false
        // Watch the emitted event Received()
        var event = supplyChain.Received()
        await event.watch((err, res) => {
            eventEmitted = true       
        }) 

        // Mark an item as Received by calling function receiveItem()
        await supplyChain.receiveItem(upc, {from: retailerID, gasPrice:0});
        
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
         const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
         const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
 
         // Verify the result set         
        assert.equal(resultBufferOne[2], retailerID, 'Error : Invalid owner ID');
        assert.equal(resultBufferOne[3], originFarmerID, 'Error : Invalid origin Farmer ID');
        assert.equal(resultBufferTwo[7], retailerID, 'Error: Invalid retailer ID')
        assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')
             
    })    

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        // Add Retailer account
        await supplyChain.addConsumer(consumerID)
        // Declare and Initialize a variable for event
        var eventEmmitted = false
        // Watch the emitted event Purchased()
        var event = supplyChain.Purchased()
        await event.watch((err, res) => {
            eventEmitted = true       
        }) 
        

        // Mark an item as Sold by calling function buyItem()
        await supplyChain.purchaseItem(upc, {from : consumerID})
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set         
       assert.equal(resultBufferOne[2], consumerID, 'Error : Invalid owner ID');
       assert.equal(resultBufferOne[3], originFarmerID, 'Error : Invalid origin Farmer ID');
       assert.equal(resultBufferTwo[8], consumerID, 'Error: Invalid consumer ID')
       assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State')
       assert.equal(eventEmitted, true, 'Invalid event emitted')
        
    })    

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        await supplyChain.fetchItemBufferOne.call(upc, {from: originFarmerID})
        await supplyChain.fetchItemBufferOne.call(upc, {from: distributorID})
        await supplyChain.fetchItemBufferOne.call(upc, {from: retailerID})
        await supplyChain.fetchItemBufferOne.call(upc, {from: consumerID})
        
        // Verify the result set:
        
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        await supplyChain.fetchItemBufferTwo.call(upc, {from: originFarmerID})
        await supplyChain.fetchItemBufferTwo.call(upc, {from: distributorID})
        await supplyChain.fetchItemBufferTwo.call(upc, {from: retailerID})
        await supplyChain.fetchItemBufferTwo.call(upc, {from: consumerID})
        
        // Verify the result set:
        
    })

});