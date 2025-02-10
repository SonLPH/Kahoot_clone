import socketio

sio = socketio.Client()
HOST_ID = "67a8b8d6b7c75e3ae75ee5c7"

@sio.event
def connect():
    print("✅ Host connected to the server!")
    sio.emit("host_join_room", {"hostId": HOST_ID})

@sio.on("host_waiting_room_updated")
def on_host_waiting_room_update(data):
     players = [p["playerName"] for p in data["players"]]
     print(f"🔹 Waiting Room Players: {players}")
     print("🕑 Waiting for the host to start the game...")

@sio.on("create_game_error")
def on_join_game_error(error_message):
    print("Received 'joinGameError' event:")
    print(error_message)

@sio.on("host_new_question")
def on_new_question(data):
    question_index = data["currentQuestionIndex"]
    print(f"\n❓ Question {question_index + 1}: Answer now!")
    print(f"🔹 {data['question']}")
    print(data["answerList"])

@sio.on("host_leaderboard_top_5")
def on_top_players(data):
    print("\n🏆 Top 5 Players This Round:")
    for index, player in enumerate(data, start=1):
        print(f"  {index}. {player['playerName']} - {player['score']} pts")
    print("🔄 Waiting for next round...")

@sio.on("host_game_finished")
def on_game_finished(data):
    print("\n🎉 Game Over! Here are the top 3 winners:")
    for index, player in enumerate(data, start=1):
        print(f"  {index}. {player['playerName']} - {player['score']} pts")
    print("🚪 Disconnecting...")

def main():
    sio.connect("http://localhost:4000")
    sio.wait()

if __name__ == "__main__":
    main()