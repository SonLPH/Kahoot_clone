import json
import asyncio
import socketio

sio = socketio.AsyncServer(cors_allowed_origins=["http://localhost:3000", "https://admin.socket.io/#/sockets"])
app = socketio.ASGIApp(sio)

game = None
leaderboard = None
players = []

# Helper functions
def add_player(user_name, socket_id):
    if not any(player['socket_id'] == socket_id for player in players):
        players.append({'user_name': user_name, 'socket_id': socket_id})

def get_player(socket_id):
    return next((player for player in players if player['socket_id'] == socket_id), None)

# Socket event handlers
@sio.event
async def connect(sid, environ):
    print(f"Socket {sid} connected")

@sio.event
async def disconnect(sid):
    print(f"Socket {sid} was disconnected")

@sio.on("init-game")
async def init_game(sid, new_game, new_leaderboard):
    global game, leaderboard
    game = json.loads(json.dumps(new_game))
    leaderboard = json.loads(json.dumps(new_leaderboard))
    await sio.enter_room(sid, game['pin'])
    print(f"Host with id {sid} started game and joined room: {game['pin']}")

@sio.on("add-player")
async def add_player_event(sid, user, socket_id, pin, cb):
    global game
    if game and game.get("pin") == pin:
        add_player(user["userName"], socket_id)
        await sio.enter_room(sid, game['pin'])
        print(f"Student {user['userName']} with id {sid} joined room {game['pin']}")
        player = get_player(socket_id)
        await sio.emit("player-added", player)
        await cb("correct", user["_id"], game["_id"])
    else:
        await cb("wrong", game["_id"])

@sio.on("start-game")
async def start_game(sid, new_quiz):
    global game
    quiz = json.loads(json.dumps(new_quiz))
    print("Move players to game")
    print(game['pin'])
    await sio.emit("move-to-game-page", game['_id'], room=game['pin'])

@sio.on("question-preview")
async def question_preview(sid, cb):
    await cb()
    await sio.emit("host-start-preview", room=game['pin'])

@sio.on("start-question-timer")
async def start_question_timer(sid, time, question, cb):
    print(f"Send question {question['questionIndex']} data to players")
    await sio.emit("host-start-question-timer", time, question, room=game['pin'])
    await cb()

@sio.on("send-answer-to-host")
async def send_answer_to_host(sid, data, score):
    global leaderboard
    player = get_player(sid)
    await sio.emit("get-answer-from-player", data, leaderboard['_id'], score, player, room=game['pin'])

# Main entry point for the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)