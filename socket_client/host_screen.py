import socketio

sio = socketio.Client()
GAME_ID = "67ab06b2edb8b333b9555ba0"

@sio.event
def connect():
    print("✅ Host connected to the server!")
    sio.emit("host_join_room", {"gameId": GAME_ID})
    sio.emit("new_question", {"gameId": GAME_ID})

@sio.on('player_joined_room')
def on_player_joined_room(data):
        players = [p["playerName"] for p in data["players"]]
        print(f"🔹 Waiting Room Players: {players}")

@sio.on('timer_update')
def on_timer_update(data):
    print(data)
    print(f"��� Current timer: {data['timeLeft']} seconds")

@sio.on("host_get_question")
def on_new_question(data):
    question_index = data["currentQuestionIndex"]
    print(f"\n�� Question {question_index + 1}: Answer now!")
    print(f"�� {data['question']}")
    print(data["answerList"])

@sio.on("question_time_up")
def on_question_time_up(data):
    sio.emit("get_leaderboard", {"gameId": data["gameId"]})

@sio.on("host_current_leaderboard")
def on_host_current_leaderboard(data):
     print("\n�� Current Leaderboard:")
     for index, player in enumerate(data, start=1):
         print(f"  {index}. {player['playerName']} - {player['score']} pts")
     print("��� Waiting for next round...")


@sio.on("host_finish_game")
def on_host_finish_game(data):
    sio.emit("finish_game", {"gameId": data["gameId"]})

@sio.on("host_new_question")
def new_question():
    sio.emit("new_question", {"gameId": GAME_ID})

@sio.on("host_final_leaderboard")
def on_final_leaderboard(data):
    print("\n�� Final Leaderboard:")
    for index, player in enumerate(data, start=1):
        print(f"  {index}. {player['playerName']} - {player['score']} pts")

@sio.event
def disconnect():
    print("❌ Disconnected from the server.")

def main():
    sio.connect("http://localhost:4000")
    sio.wait()

if __name__ == "__main__":
    main()