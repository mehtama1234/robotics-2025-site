COURSE_TITLE = "Robotics From First Principles"
COURSE_SUBTITLE = (
    "A plain-language course spine for the ICRA, IROS, CoRL, and RSS robotics site."
)

INTRO = [
    "Robotics starts with a simple wish: make a machine do useful work in the physical world. "
    "That sounds direct until you notice what the machine must face. The world is messy. Floors "
    "slip, objects move, sensors lie, people do unexpected things, batteries run down, and a "
    "small mistake can break hardware or hurt someone.",
    "So the whole field can be read as one long answer to one question: how does a machine sense "
    "what is around it, decide what should happen next, move its body, and then check whether the "
    "world changed the way it expected? Every conference topic is one part of that loop.",
    "This course uses everyday words first. Math and code matter, but they matter because they "
    "serve this loop. A robot is not a model on a screen. It is a loop tied to a body.",
]

SECTIONS = [
    {
        "title": "1. The Loop: Sense, Decide, Move, Check",
        "plain_problem": (
            "A robot cannot do a task in one shot. It must keep looking, choosing, acting, and "
            "correcting. The world pushes back every moment."
        ),
        "first_principle": (
            "A robot is a closed loop. Sensors measure the world. The computer turns measurements "
            "into a state. A planner or policy chooses an action. Motors change the world. New "
            "sensor readings say whether the action helped or made things worse."
        ),
        "why_it_matters": (
            "This is why robotics feels harder than vision alone or language alone. A wrong answer "
            "does not just sit on a page. It becomes motion. The loop must be fast enough to react "
            "and careful enough not to drift into danger."
        ),
        "applications": [
            "factory arms that adjust after a part shifts on a conveyor",
            "self-driving cars that brake when a pedestrian steps into the road",
            "warehouse robots that replan when an aisle is blocked",
            "surgical robots that steady motion while tissue moves",
        ],
    },
    {
        "title": "2. Seeing: Turning Sensor Readings Into a Usable World",
        "plain_problem": (
            "Sensors do not hand the robot a clean world. Cameras give flat images. Lidars give "
            "point clouds. Touch sensors give pressure. The robot has to turn all of that into "
            "something it can use."
        ),
        "first_principle": (
            "Perception is measurement plus interpretation. The machine must infer what is present, "
            "where it is, how it is moving, and which parts matter for the task. It is always filling "
            "gaps because no sensor sees everything."
        ),
        "why_it_matters": (
            "Bad seeing poisons every later step. If a robot thinks the table is lower than it is, "
            "the best planner in the world still sends the hand to the wrong place."
        ),
        "applications": [
            "3D perception for picking, inspection, mapping, and driving",
            "open-vocabulary perception for finding objects named in plain language",
            "tactile sensing for grip, slip, and hidden contact",
            "medical imaging where the robot sees inside the body instead of across a room",
        ],
    },
    {
        "title": "3. Topology: What Stays Connected When the Shape Changes",
        "plain_problem": (
            "Robots care about more than exact coordinates. They need to know what is connected to "
            "what, which paths are blocked, what surrounds what, and whether a motion can be changed "
            "without crossing an obstacle."
        ),
        "first_principle": (
            "Topology is the study of the parts of shape that survive bending and stretching. For a "
            "robot, that means connected regions, holes, loops, inside versus outside, boundaries, "
            "and paths that cannot be smoothly changed into each other."
        ),
        "why_it_matters": (
            "A map can be drawn with exact metric distances, but the robot often first needs the "
            "topological fact: can I get from this room to that room without crossing a wall? Can "
            "this cable move around that post without tangling? Is the hand inside the safe region "
            "or outside it?"
        ),
        "applications": [
            "navigation graphs that reduce a building to rooms, doors, and corridors",
            "motion planning where paths around different sides of an obstacle are different choices",
            "multi-robot routing where agents must avoid swapping through the same narrow passage",
            "deformable objects, cables, knots, cloth, and surgical threads",
            "coverage planning where the robot must visit every connected part of an area",
        ],
    },
    {
        "title": "4. Geometry: Distances, Angles, Poses, and Contact",
        "plain_problem": (
            "Topology says whether a path exists. Geometry says how far, at what angle, through "
            "which pose, and with what clearance."
        ),
        "first_principle": (
            "Geometry gives the robot a language for space. A pose tells where the body is and how "
            "it is rotated. A transform moves points between coordinate systems. Contact geometry "
            "says where surfaces touch and which motions are blocked."
        ),
        "why_it_matters": (
            "Robots live in millimeters and degrees. A grasp can fail because the wrist is rotated "
            "slightly wrong. A drone can crash because the map is almost right but not right enough."
        ),
        "applications": [
            "camera calibration and hand-eye calibration",
            "SLAM, where a robot builds a map while localizing itself in it",
            "grasp planning for fingers and suction cups",
            "legged locomotion over steps, slopes, and uneven ground",
        ],
    },
    {
        "title": "5. Planning: Choosing a Path Through Too Many Possibilities",
        "plain_problem": (
            "A robot can usually move in many possible ways. Most are bad, slow, unsafe, or impossible. "
            "Planning is choosing a useful path before the world changes."
        ),
        "first_principle": (
            "Planning searches through possible futures. It keeps the futures that satisfy the task "
            "and throws away the ones that collide, exceed the robot's limits, waste too much time, "
            "or end in the wrong place."
        ),
        "why_it_matters": (
            "Without planning, a robot only reacts. With planning, it can choose a route, prepare for "
            "a turn, move around a person, or break a task into steps."
        ),
        "applications": [
            "road driving, drone flight, warehouse routing, and mobile manipulation",
            "task-and-motion planning for jobs with both symbolic steps and physical paths",
            "multi-robot path finding where many agents must share the same space",
            "online planning where the robot replans every few milliseconds",
        ],
    },
    {
        "title": "6. Control: Making the Body Actually Follow the Plan",
        "plain_problem": (
            "A plan is only a wish until motors execute it. Bodies have mass, friction, limits, "
            "delays, and unexpected pushes."
        ),
        "first_principle": (
            "Control is feedback. Measure the gap between what should happen and what is happening, "
            "then push the system in the direction that reduces that gap while respecting the body's "
            "limits."
        ),
        "why_it_matters": (
            "This is where paper plans meet physics. A controller turns a desired path into torques, "
            "wheel speeds, joint angles, and forces."
        ),
        "applications": [
            "model-predictive control for cars, drones, arms, and legs",
            "whole-body control for humanoids and quadrupeds",
            "force control for polishing, cutting, insertion, and surgery",
            "safety filters that override a learned action before it crosses a boundary",
        ],
    },
    {
        "title": "7. Learning: Getting Skill From Examples and Trial",
        "plain_problem": (
            "Some tasks are too hard to program by hand. Picking up strange objects, walking on "
            "rough ground, or following open-ended instructions cannot be reduced to a short list of rules."
        ),
        "first_principle": (
            "Learning replaces hand-written rules with experience. The robot sees examples, tries "
            "actions, receives feedback, and changes its internal mapping from situations to actions."
        ),
        "why_it_matters": (
            "Learning gives robots flexibility, but it also creates a new burden: the robot must have "
            "enough varied experience and must not learn shortcuts that fail outside training."
        ),
        "applications": [
            "imitation learning from human demonstrations",
            "reinforcement learning in simulation before real-world testing",
            "diffusion and flow policies that generate whole action paths",
            "foundation-model planners that use web-scale visual and language knowledge",
        ],
    },
    {
        "title": "8. Data: Why Real Robot Experience Is Expensive",
        "plain_problem": (
            "Robots need examples, but real examples are slow. Every trial takes physical time, "
            "hardware wears out, and failures can be costly."
        ),
        "first_principle": (
            "Data is not just a file. In robotics, data is time spent in the world. The field keeps "
            "trying to make each real trial teach more, and to replace some real trials with useful "
            "simulation, video, generated scenes, or shared datasets."
        ),
        "why_it_matters": (
            "Many impressive ideas fail because they need more robot experience than anyone can "
            "collect. Data is one of the main reasons robotics moves slower than pure software."
        ),
        "applications": [
            "sim-to-real training with randomized worlds",
            "learning from human video before touching a robot",
            "synthetic data for rare driving and factory cases",
            "cross-embodiment learning where one robot teaches another",
        ],
    },
    {
        "title": "9. Trust: Knowing When the Robot Must Not Act",
        "plain_problem": (
            "A flexible robot is useful because it can handle variety. That same flexibility makes "
            "it harder to know exactly what it will do next."
        ),
        "first_principle": (
            "Trust comes from boundaries, checks, fallback behavior, and honest uncertainty. The "
            "robot should know when it is unsure, when a command is unsafe, and when to use a simpler "
            "verified behavior instead."
        ),
        "why_it_matters": (
            "Robots share space with people, roads, tools, and fragile objects. Safety is not an "
            "extra feature. It is part of the definition of a working robot."
        ),
        "applications": [
            "control barrier functions that keep the robot inside a safe set",
            "uncertainty estimates for medical, driving, and human-robot settings",
            "runtime monitors that stop a policy before damage happens",
            "formal checks for collision avoidance and shared-space motion",
        ],
    },
    {
        "title": "10. Cross-Field Use: Why Robotics Connects to Everything Else",
        "plain_problem": (
            "Robotics borrows from many fields because a robot contains many problems at once: "
            "seeing, language, maps, bodies, chips, safety, and human use."
        ),
        "first_principle": (
            "A robot is a meeting point. Computer vision supplies sight. Machine learning supplies "
            "adaptation. Control supplies feedback. Topology and geometry supply space. Hardware "
            "sets the speed and energy limits. Human factors decide whether the machine is useful."
        ),
        "why_it_matters": (
            "This is why robotics is a useful way to understand the larger AI stack. If an idea only "
            "works in a clean benchmark but fails when tied to sensors, bodies, delays, and safety, "
            "robotics exposes the gap."
        ),
        "applications": [
            "AI hardware for low-power onboard inference",
            "computer vision for depth, tracking, and scene understanding",
            "speech and language for natural instructions and feedback",
            "search and planning for maps, task order, and decision making",
            "graphics and simulation for training worlds and digital twins",
        ],
    },
]
