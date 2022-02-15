const arena = {
    //Definition for each element
    planeWidth: 8,
    planeHeight: 6,
    mantinelWidth: 8,
    mantinelHeight: 0.3,
    mantinelDepth: 0.3,
    ringOuterRadius: 0.75,
    ringInnerRadius: 0.7,
    circleRadius: 0.1,
    lineWidth: 2.46,
    lineHeight: 0.033,
    lineDepth: 0.11,
    paddleWidth: 1.5,
    paddleHeight: 0.2,
    paddleDepth: 0.2,
    ballRadius: 0.1,
    smoothSegments: 50, //To make circles, spheres, rings round

    //Set position and rotation
    setPositionRotation: (position, rotation, element) => {
        element.position.x = position[0]
        element.position.y = position[1]
        element.position.z = position[2]
        element.rotation.x = rotation[0] * Math.PI / 180
        element.rotation.y = rotation[1] * Math.PI / 180
        element.rotation.z = rotation[2] * Math.PI / 180
        //return element
    },

    //Start creating
    generateBox: (width, height, depth, color = 0xffffff, position = [0,0,0], rotation = [0,0,0]) => {
        var geometry = new THREE.BoxGeometry(width, height, depth)
        var material = new THREE.MeshPhongMaterial({color: color})
        var mesh = new THREE.Mesh(geometry, material)
        arena.setPositionRotation(position,rotation, mesh)
        mesh.castShadow = true
        mesh.receiveShadow = true
        return mesh
    },
    
    //Generate plane
    generatePlane: (width, height, color = 0xffffff, position = [0,0,0], rotation = [0,0,0]) => {
        var geometry = new THREE.PlaneGeometry(width, height)
        var material = new THREE.MeshPhongMaterial( {color: color, side: THREE.DoubleSide})
        var mesh = new THREE.Mesh(geometry, material)
        arena.setPositionRotation(position,rotation, mesh)
        mesh.receiveShadow = true
        //mesh.castShadow = true
        return mesh
    },

    //GenerateRing
    generateRing: (innerRadius, outerRadius, thetaSegments, color = 0xffffff, position = [0,0,0], rotation = [0,0,0]) => {
        var geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments)
        var material = new THREE.MeshPhongMaterial({color: color})
        var mesh = new THREE.Mesh(geometry, material)
        arena.setPositionRotation(position,rotation, mesh)
        mesh.castShadow = true
        mesh.receiveShadow = true
        return mesh
    },
    
    //GenerateCircle
    generateCircle: (radius, thetaSegments, color = 0xffffff, position = [0,0,0], rotation = [0,0,0]) => {
        var geometry = new THREE.CircleGeometry(radius, thetaSegments)
        var material = new THREE.MeshPhongMaterial({color: color})
        var mesh = new THREE.Mesh(geometry, material)
        arena.setPositionRotation(position,rotation, mesh)      
        mesh.castShadow = true
        mesh.receiveShadow = true
        return mesh
    },

    //Generate Sphere
    generateSphere: (radius, heightSegments, widthSegments, color = 0xffffff, position = [0,0,0], rotation = [0,0,0]) => {
        var geometry = new THREE.SphereGeometry(radius, heightSegments, widthSegments)
        var material = new THREE.MeshPhongMaterial({color: color})
        var mesh = new THREE.Mesh(geometry, material)
        arena.setPositionRotation(position, rotation, mesh)
        mesh.receiveShadow = true
        mesh.castShadow = true
        return mesh
    },

    //Build arena - add elements to scene
    buildArena: (scene) => {
        //Add ground
        arena.ground = arena.generatePlane(arena.planeWidth, arena.planeHeight, 0x4FA6C7, [0,0.01,0], [90,0,0])
        scene.add(arena.ground)
        
        //Add left panel
        arena.leftPanel = arena.generateBox(arena.mantinelWidth, arena.mantinelHeight, arena.mantinelDepth, 0xffffff, [0, 0.150, -3.150]) 
        scene.add(arena.leftPanel)

        //Add right panel
        arena.rightPanel = arena.generateBox(arena.mantinelWidth, arena.mantinelHeight, arena.mantinelDepth, 0xffffff, [0, 0.150, 3.150]) 
        scene.add(arena.rightPanel)

        //Add center ring
        arena.centerRing = arena.generateRing(arena.ringInnerRadius, arena.ringOuterRadius, arena.smoothSegments, 0xffffff, [0,0.02,0], [-90, 0, 0]) 
        scene.add(arena.centerRing)

        //Add center circle
        arena.centerCircle = arena.generateCircle(arena.circleRadius, arena.smoothSegments, undefined, [0, 0.02, 0], [-90, 0, 0])
        scene.add(arena.centerCircle)

        //Add left line
        arena.leftLine = arena.generateBox(arena.lineWidth, arena.lineHeight, arena.lineDepth, undefined, [0, 0, -2], [0, 90, 0])
        scene.add(arena.leftLine)

        //Add right line
        arena.rightLine = arena.generateBox(arena.lineWidth, arena.lineHeight, arena.lineDepth, undefined, [0, 0, 2], [0, 90, 0])
        scene.add(arena.rightLine)
        
        //Add first paddle
        arena.paddle1 = arena.generateBox(arena.paddleWidth, arena.paddleHeight, arena.paddleDepth, undefined, [-3.4,0.1,0], [0,-90,0])
        arena.paddle1.DirZ = 0
        scene.add(arena.paddle1)

        //Add second paddle
        arena.paddle2 = arena.generateBox(arena.paddleWidth, arena.paddleHeight, arena.paddleDepth, undefined, [3.4,0.1,0], [0,-90,0]) 
        arena.paddle2.DirZ = 0
        scene.add(arena.paddle2)

        //Add ball
        arena.ball = arena.generateSphere(arena.ballRadius, arena.smoothSegments, arena.smoothSegments, undefined, [0,0.14,0]) 
        scene.add(arena.ball)
    }

}