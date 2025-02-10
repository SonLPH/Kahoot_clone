import socketio
# Create a Socket.IO client instance
sio = socketio.Client()

PLAYER_NAME_1 = "Alice"
PLAYER_NAME_2 = "SonLPH"
PLAYER_NAME_3 = "Bobby"
GAME_ID_1 = "67a504c943381482f1a59588"
GAME_ID_2 = "67a8fac6fcd792c7fc992a9f"
@sio.event
def connect():
    print("✅ Connected to the server!")
    print(f"🔹 Joining game as {PLAYER_NAME_2}...")
    sio.emit("join_game", {"gameId": GAME_ID_2, "playerName": PLAYER_NAME_2})

@sio.on("join_game_error")
def on_join_game_error(error_message):
    print("Received 'joinGameError' event:")
    print(error_message)

@sio.event
def connect_error(data):
    print("Failed to connect to the server:", data)



@sio.on("start_game_error")
def on_start_game_error(error_message):
    print("Received'startGameError' event:")
    print(error_message)

@sio.on("player_new_question")
def on_next_question(data):
    question_index = data["currentQuestionIndex"]
    print(f"\n❓ Question {question_index + 1}: Answer now!")
    print(f"🔹 {data['question']}")
    print(data["answerList"])

    playerAnswer = {
        "isAnswerd": True,
        "answer": 2,
        "time": 1
    }
    print(f"✅ Submitting answer: {2}...")
    sio.emit("player_submit_answer", {
        "gameId": data["id"],
        "playerName": PLAYER_NAME_2,
        "playerAnswer": playerAnswer
    })

@sio.on("player_leaderboard_top_5")
def on_top_players(data):
    print("\n🏆 Top 5 Players This Round:")
    for index, player in enumerate(data, start=1):
        print(f"  {index}. {player['playerName']} - {player['score']} pts")
    print("🔄 Waiting for next round...")


@sio.on("player_game_finished")
def on_game_finished(data):
    print("\n🎉 Game Over! Here are the top 3 winners:")
    for index, player in enumerate(data, start=1):
        print(f"  {index}. {player['playerName']} - {player['score']} pts")
    print("🚪 Disconnecting...")
    # sio.disconnect()

@sio.event
def disconnect():
    print("❌ Disconnected from the server.")

def main():
    sio.connect("http://localhost:4000")
    sio.wait()

if __name__ == "__main__":
    main()