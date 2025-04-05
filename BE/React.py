from flask import Flask, request, jsonify
from flask_cors import CORS
import pyodbc

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Database connection function (to avoid connection leaks)
def get_db_connection():
    return pyodbc.connect(
        'DRIVER={SQL Server};'
        'SERVER=ANONYMOUS;'  # Replace with actual server name
        'DATABASE=Scorer;'
        'Trusted_Connection=yes;'  # Change if using SQL authentication
    )

@app.route('/login', methods=['POST'])
def login():
    try:
        # Parse JSON request
        request_data = request.get_json()
        email = request_data.get('email')
        password = request_data.get('password')

        # Ensure both fields are provided
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Establish a new database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute stored procedure
        cursor.execute("{CALL [msd].[Validate_UserLogin] (?, ?)}", (email, password))
        result = cursor.fetchone()

        # Process result
        if result is None:
            return jsonify({'error': 'Invalid credentials'}), 401
        else:
            return jsonify({'message': 'Login successful'}), 200

    except Exception as e:
        print(f"Error processing login: {str(e)}")
        return jsonify({'error': str(e)}), 500
    

@app.route('/get_seriesmasterData', methods=['GET'])
def get_seiesdata():
    try:

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor = conn.cursor()
        cursor.execute("EXEC [msd].[SelectMatchSeriesMasterData]")
        
        series_data = []

        for row in cursor.fetchall():
            series_name = row.SeriesName
            series_location = row.SeriesLocation
            picture_url = row.PictureUrl
            series_id = row.SeriesId
            series_data.append({'SeriesId': series_id, 'SeriesName': series_name, 'SeriesLocation': series_location, 'PictureUrl': picture_url})

        print(series_data)
        return jsonify(series_data)
        
    except Exception as e:
        # Handle exceptions and return an error response
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  # Print the error message to the console
        return jsonify({'error': error_message}), 500


@app.route('/get_SeriesWisematches', methods=['GET'])
def get_series_match_details():
    try:

        seriesId = request.args.get('seriesId', type=int)
        # Create a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query to fetch match details (Replace with your actual query)
        cursor.execute("EXEC [msd].[SelectMatchListDetails] ?", (seriesId))

        # Prepare list to hold match details
        match_details = []

        # Fetch rows from the result
        for row in cursor.fetchall():
            match = {
                "MatchLocation": row.MatchLocation,
                "TeamA": row.TeamA,
                "TeamB": row.TeamB,
                "TeamAImage": row.TeamAImage,
                "TeamBImage": row.TeamBImage,
                "SeriesName": row.SeriesName,
                "MatchDate": row.MatchDate,
                "MatchTime": row.MatchTime,
                "MatchId": row.MatchId,
                "MatchStatus": row.MatchStatus
            }
            match_details.append(match)

            print(match_details)

        # Return the match details as a JSON response
        return jsonify(match_details), 200

    except Exception as e:
        error_message = f"Error fetching match details: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get_TeamDetails', methods=['GET'])
def get_team_details():
    try:

        # Create a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query to fetch match details (Replace with your actual query)
        cursor.execute("EXEC [msd].[Select_TeamDetails]")

        # Prepare list to hold match details
        team_details = []

        # Fetch rows from the result
        for row in cursor.fetchall():
            team = {
                "TeamLocation": row.TeamLocation,
                "TeamName": row.TeamName,
                "TeamPictureUrl": row.TeamPictureUrl,
                "TeamId": row.TeamId
            }
            team_details.append(team)

            print(team_details)

        # Return the match details as a JSON response
        return jsonify(team_details), 200

    except Exception as e:
        error_message = f"Error fetching match details: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get_TeamDetailsById', methods=['GET'])
def get_team_details_by_id():
    try:
        # Get the teamId from the query parameters
        teamId = request.args.get('teamId', type=int)
        
        # Check if the teamId is provided and is valid
        if teamId is None:
            return jsonify({"error": "teamId is required"}), 400

        # Create a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query to fetch the team details based on teamId
        cursor.execute("{CALL [msd].[Select_TeamDataByTeamId] (?)}", (teamId,))

        # Fetch the team details from the result
        team_details = cursor.fetchone()  # Use fetchone() if you're expecting only one record

        print(team_details)

        # If no team is found, return an error message
        if team_details is None:
            return jsonify({"error": "Team not found"}), 404

        # Create a dictionary to hold the team data
        team = {
            "TeamId": team_details.TeamId,
            "TeamName": team_details.TeamName,
            "TeamPictureUrl": team_details.TeamPictureUrl,
            "TeamLocation": team_details.TeamLocation
        }

        # Return the team details as a JSON response
        return jsonify(team), 200

    except Exception as e:
        # Log the error for debugging purposes
        error_message = f"Error fetching team details: {str(e)}"
        print(error_message)
        
        # Return an error message if an exception occurs
        return jsonify({"error": error_message}), 500
    
@app.route('/add_teams', methods=['POST'])
def add_teams():
    try:
        # Get the data from the request
        request_data = request.get_json()

        # Extract values from the request data
        team_Name = request_data['TeamName']
        team_location = request_data['TeamLocation']
        team_pictureurl = request_data['TeamPictureUrl']

        #series_id = request_data['seriesid']
        # Create a cursor object to execute SQL commands
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute the stored procedure [msd].[AddSeries] with the values as parameters
        cursor.execute("{CALL [msd].[Insert_Teams] (?, ?, ?)}", 
                       (team_Name, team_location, team_pictureurl))

        # Commit the transaction
        conn.commit()

        response_data = {'message': 'Team inserted successfully.'}
        return jsonify(response_data), 200

    except Exception as e:
        # Handle exceptions and rollback the transaction if an error occurs
        error_message = f"Error inserting data: {str(e)}"
        print(error_message)  # Print the error message to the console
        return jsonify({'error': error_message}), 500


@app.route('/save_match', methods=['POST'])
def save_match():
    try:

        # Get the data from the request
        request_data = request.get_json()

        # Extract values from the request data
        matchType = request_data['matchType']
        matchOvers = request_data['matchOvers']
        matchLocation = request_data['matchLocation']
        matchDateTime = request_data['matchDateTime']
        seriesId = request_data['seriesId']
        teamId = request_data['teamId']
        scorer_name = request_data['scorerName']
        #series_id = request_data['seriesid']
        # Create a cursor object to execute SQL commands
        conn = get_db_connection()
        cursor = conn.cursor()

        print(matchType, matchOvers, matchLocation, matchDateTime, seriesId, teamId, scorer_name)
        # Execute the stored procedure [msd].[AddSeries] with the values as parameters
        cursor.execute("{CALL [msd].[AddMatchDetails] (?, ?, ?, ?, ?, ?, ?)}", 
                       (matchType, matchOvers, matchLocation, matchDateTime, seriesId, teamId, scorer_name))
        
       
        # Commit the transaction
        conn.commit()

        response_data = {'message': 'Match inserted successfully.'}
        return jsonify(response_data), 200

    except Exception as e:
        # Handle exceptions and rollback the transaction if an error occurs
        error_message = f"Error inserting data: {str(e)}"
        print(error_message)  # Print the error message to the console
        return jsonify({'error': error_message}), 500
    
@app.route('/save_player', methods=['POST'])
def save_player():

    try:
        data = request.get_json()
        teamId = data['teamId']
        playername = data['playername']
        bowlingstyle = data['bowlingstyle']
        battingstyle = data['battingstyle']
        birthdate = data['birthdate']
        iswicketkeeper = data['iswicketkeeper']

        print(data)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("{CALL [msd].[Add_Player] (?, ?, ?, ?, ?, ?)}", (teamId, playername, bowlingstyle, battingstyle, birthdate, iswicketkeeper))

        # Commit the transaction
        conn.commit()

        response_data = {'message': 'Player inserted successfully.'}
        return jsonify(response_data), 200

    except Exception as e:
        # Handle exceptions and rollback the transaction if an error occurs
        error_message = f"Error inserting data: {str(e)}"
        print(error_message)  # Print the error message to the console
        return jsonify({'error': error_message}), 500
    
@app.route('/get_Players')
def get_players_data():
    try:
        teamId = request.args.get('teamId', type=int)
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("EXEC [msd].[GetPlayerData] @teamId=?", (teamId,))


        player_data = []

        for row in cursor.fetchall():
            player_name = row.PlayerName
            player_id = row.PlayerId
            player_data.append({
                'PlayerName':player_name,
                'PlayerId': player_id}
                )

        print(player_data)
        return jsonify(player_data)

    except Exception as e:
        # Handle exceptions and return an error response
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  # Print the error message to the console
        return jsonify({'error': error_message}), 500
    
@app.route('/deleteMatchById', methods=['POST'])
def deleteMatch():
    try:
        # Parse JSON request
        request_data = request.get_json()
        matchId = request_data.get('matchId')

        if not matchId:
            return jsonify({'error': 'matchId is required'}), 400  # Return error if matchId is missing

        # Establish a new database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute stored procedure
        cursor.execute("{CALL [msd].[DeleteMatch] (?)}", (matchId))

        # Commit the transaction
        conn.commit()

        # Check if the delete was successful
        # If the stored procedure returns a result or message indicating success, you can check it here.
        # Assuming no result means success (modify if needed based on your stored procedure).
        
        return jsonify({'message': 'Delete successful'}), 200  # Return success message

    except Exception as e:
        print(f"Error processing deletion: {str(e)}")
        return jsonify({'error': str(e)}), 500  # Return error response on failure
    
@app.route('/get_MatchDetailsByMatchId', methods=['GET'])
def get_match_detailsbyId():
    try:
        matchId = request.args.get('matchId')  # Use request.args.get() for query parameters
        
        if not matchId:
            return jsonify({"error": "Match ID is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[Select_MatchDetailsFromMatchId] ?", (matchId))
        match_details = []

        for row in cursor.fetchall():
            match = {
                "HomeTeamId": row.HomeTeamId,
                "VisitorsTeamId": row.VisitorsTeamId,
                "Home": row.Home,
                "Visitors": row.Visitors,
                "HomePictureUrl": row.HomePictureUrl,
                "VisitorsPictureUrl": row.VisitorsPictureUrl,
            }
            match_details.append(match)

        print(match_details)

        return jsonify(match_details), 200

    except Exception as e:
        error_message = f"Error fetching match details: {str(e)}"
        return jsonify({"error": error_message}), 500

@app.route('/saveTossDetails', methods=['POST'])
def saveTossDetails():
    try:
        # Parse JSON request
        request_data = request.get_json()

        matchId = request_data.get('matchId')
        teamName = request_data.get('teamName')
        selectedOption = request_data.get('selectedOption')

        # Check if matchId, teamId, and selectedOption are provided
        if not matchId or not teamName or not selectedOption:
            return jsonify({'error': 'matchId, teamId, and selectedOption are required'}), 400

        # Establish a new database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # You can adjust the SQL to save the toss details
        # Assuming you want to save the toss details instead of deleting a match
        cursor.execute("EXEC [msd].[Update_MatchTossDetails] ?, ?, ?", (matchId, teamName, selectedOption))

        # Commit the transaction
        conn.commit()

        # Return success message
        return jsonify({'message': 'Toss details saved successfully'}), 200

    except Exception as e:
        print(f"Error processing toss details: {str(e)}")
        return jsonify({'error': str(e)}), 500  # Return error response on failure

@app.route('/get_PlayersByTeamName', methods=['GET'])
def get_players_data_by_team_name():
    try:
        teamName = request.args.get('teamName')  # Get the 'teamName' parameter from the URL
        conn = get_db_connection()  # Get database connection
        cursor = conn.cursor()

        # Replace the SQL query with the one you need
        cursor.execute("EXEC [msd].[GetPlayerDataByTeamName] @teamName=?", (teamName,))

        player_data = []

        # Loop through the results and store them in player_data list
        for row in cursor.fetchall():
            player_name = row.PlayerName
            player_id = row.PlayerId
            player_data.append({
                'playerName': player_name,
                'playerId': player_id
            })

        cursor.close()  # Close the cursor

        return jsonify(player_data)  # Return the player data as a JSON response

    except Exception as e:
        # Handle exceptions and return an error response
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  # Log error to console
        return jsonify({'error': error_message}), 500  # Return error message

@app.route('/get_PlayersByTeamId', methods=['GET'])
def get_players_data_by_team_Id():
    try:
        teamId = request.args.get('teamId', type=int)  # Get the 'teamId' parameter from the URL
        matchId = request.args.get('matchId', type=int)  # Get the 'matchId' parameter from the URL

        conn = get_db_connection()  # Get database connection
        cursor = conn.cursor()

        # Execute the stored procedure with the parameters
        cursor.execute("EXEC [msd].[GetPlayerDataByTeamId] @TeamId=?, @MatchId=?", (teamId, matchId))

        player_data = []

        # Loop through the results and store them in player_data list
        for row in cursor.fetchall():
            player_id = row[0]  # PlayerId is in the first column
            player_name = row[1]  # PlayerName is in the second column
            player_data.append({
                'playerName': player_name,
                'playerId': player_id
            })

        cursor.close()  # Close the cursor

        return jsonify(player_data)  # Return the player data as a JSON response

    except Exception as e:
        # Handle exceptions and return an error response
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  # Log error to console
        return jsonify({'error': error_message}), 500  # Return error message

@app.route('/get_bowlers', methods=['GET'])  # Fix route name here
def get_bowlers_match_id():
    try:
        matchId = request.args.get('matchId')  # Get the 'teamName' parameter from the URL
        conn = get_db_connection()  # Get database connection
        cursor = conn.cursor()

        # Replace the SQL query with the o ne you need
        cursor.execute("EXEC [msd].[GetPlayerDataByMatchId] @matchId=?", (matchId))

        player_data = []

        # Loop through the results and store them in player_data list
        for row in cursor.fetchall():
            player_name = row.PlayerName
            player_id = row.PlayerId
            player_data.append({
                'playerName': player_name,
                'playerId': player_id
            })

        cursor.close()  # Close the cursor

        return jsonify(player_data)  # Return the player data as a JSON response

    except Exception as e:
        # Handle exceptions and return an error response
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  # Log error to console
        return jsonify({'error': error_message}), 500  # Return error message

@app.route('/save_selectedplayerdata', methods=['POST'])
def save_match_starting_data():
    try:
        data = request.json
        match_id = data['matchId']
        selected_batter_ids = data['selectedBatterIds']
        selected_bowler_id = data['selectedBowlerId']

        # Ensure all incoming data is valid
        if not match_id or not selected_batter_ids or not selected_bowler_id:
            return jsonify({"error": "Missing required data"}), 400

        # Get database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert the selected batters
        for batter_id in selected_batter_ids:
            cursor.execute("EXEC [msd].[InsertSelectedBatter] @matchId=?, @batterId=?", (match_id, batter_id))

        # Insert the selected bowler
        cursor.execute("EXEC [msd].[InsertSelectedBowler] @matchId=?, @bowlerId=?", (match_id, selected_bowler_id))

        # Commit the changes to the database
        conn.commit()
        cursor.close()

        # Return success response
        return jsonify({"message": "Match started successfully"}), 200

    except Exception as e:
        # Return error message if something goes wrong
        return jsonify({"error": str(e)}), 500


@app.route('/save_selectedNewBowler', methods=['POST'])
def save_selectedNewBowle():
    try:
        data = request.json
        match_id = data['matchId']
        selected_bowler_id = data['selectedBowlerId']

        # Get database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert the selected bowler
        cursor.execute("EXEC [msd].[InsertNewSelectedBowler] @matchId=?, @bowlerId=?", (match_id, selected_bowler_id))

        # Commit the changes to the database
        conn.commit()
        cursor.close()

        # Return success response
        return jsonify({"message": "Match started successfully"}), 200

    except Exception as e:
        # Return error message if something goes wrong
        return jsonify({"error": str(e)}), 500

@app.route('/save_selectedNewBatsman', methods=['POST'])
def save_new_Batsaman_data():
    try:
        # Parse the incoming JSON data
        data = request.json
        match_id = data.get('matchId')  # Use .get() to handle missing keys gracefully
        selected_batter_ids = data.get('selectedBatterIds')

        # Log the received data for debugging
        print(f"Received match_id: {match_id}")
        print(f"Received selected_batter_ids: {selected_batter_ids}")

        # Ensure that both match_id and selected_batter_ids are provided
        if not match_id or not selected_batter_ids:
            return jsonify({"error": "Missing required data"}), 400

        # Get database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Log the batter IDs being processed
        print(f"Processing the following batter IDs: {selected_batter_ids}")

        # Insert the selected batters into the database
        for batter_id in selected_batter_ids:
            cursor.execute("EXEC [msd].[InsertSelectedNewBatter] @matchId=?, @batterId=?", (match_id, batter_id))

        # Commit the changes to the database
        conn.commit()
        cursor.close()

        # Return success response
        return jsonify({"message": "Match started successfully"}), 200

    except Exception as e:
        # Log error if something goes wrong
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/get_matchstartingdata', methods=['GET'])
def get_match_staring_data():
    try:
        matchId = request.args.get('matchId')  # Get the 'matchId' parameter from the URL
        conn = get_db_connection()  # Get database connection
        cursor = conn.cursor()

        # Execute the stored procedure with matchId parameter
        cursor.execute("EXEC [msd].[GetMatchStartingDataByMatchId] @MatchId=?", (matchId,))

        # Initialize empty lists for batsmen and bowlers
        batsmen_data = []
        bowlers_data = []
        totalScore = 0  # Default total score
        wickets = 0
        overCount = 0
        ballsForOver = 0

        # Fetch batsman data
        batsman_result = cursor.fetchall()
        for row in batsman_result:
            batsmen_data.append({
                'batsmanId': row.BatsmanId,
                'batsmanName': row.BatsmanName,
                'battingTeamId': row.BattingTeamId,
                'runs': row.Runs,
                'balls': row.Balls,
                'fours': row.Fours,
                'sixes': row.Sixes
            })

        cursor.nextset()

        # Fetch bowler data
        bowler_result = cursor.fetchall()
        for row in bowler_result:
            bowlers_data.append({
                'bowlerId': row.BowlerId,
                'bowlerName': row.BowlerName,
                'bowlingTeamId': row.BowlingTeamId,
                'overs': row.Overs,
                'balls': row.Balls,
                'maidens': row.Maidens,
                'runs': row.Runs,
                'wickets': row.Wickets
            })

        cursor.nextset()

        # Fetch total score
        total_score_result = cursor.fetchone()
        if total_score_result:
            totalScore = total_score_result.TotalScore  # Extract total runs

        cursor.nextset()

        # Fetch total score
        total_wickets_result = cursor.fetchone()
        if total_score_result:
            wickets = total_wickets_result.Wickets  # Extract total runs

        cursor.nextset()

        # Fetch total score
        total_overs_result = cursor.fetchone()
        if total_score_result:
            overCount = total_overs_result.OverCount  # Extract total runs


        cursor.nextset()

        # Fetch total score
        total_balls_per_over_result = cursor.fetchone()
        if total_score_result:
            ballsForOver = total_balls_per_over_result.BallsForOver  # Extract total runs


        cursor.close()  # Close the cursor

        # Return batsman, bowler data, and total score as a JSON response
        return jsonify({
            'batsmen': batsmen_data,
            'bowlers': bowlers_data,
            'totalScore': totalScore,
            'wickets': wickets,
            'overCount': overCount,
            'ballsForOver': ballsForOver
              # Include total score in response
        })

    except Exception as e:
        # Handle exceptions and return an error response
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  # Log error to console
        return jsonify({'error': error_message}), 500  # Return error message


@app.route('/AddBatsmanDismissal', methods=['POST'])
def AddBatsmanDismissal():
    try:
        # Parse JSON request
        request_data = request.get_json()

        matchId = request_data.get('matchId')
        playerId = request_data.get('playerId')
        teamId = request_data.get('teamId')
        dismissalType = request_data.get('dismissalType')

        # Establish a new database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # You can adjust the SQL to save the toss details
        # Assuming you want to save the toss details instead of deleting a match
        cursor.execute("EXEC [msd].[Add_PlayerDismissal] ?, ?, ?, ?", (matchId, playerId, teamId, dismissalType))

        # Commit the transaction
        conn.commit()

        # Return success message
        return jsonify({'message': 'Dismissal details saved successfully'}), 200

    except Exception as e:
        print(f"Error processing toss details: {str(e)}")
        return jsonify({'error': str(e)}), 500  # Return error response on failure

@app.route('/AddRuns', methods=['POST'])
def AddRuns():
    try:
        # Parse JSON request
        request_data = request.get_json()

        print(request_data)

        matchId = request_data.get('matchId')
        batsmanId = request_data.get('batsmanId')
        bowlerId = request_data.get('bowlerId')
        battingTeamId = request_data.get('battingTeamId')
        bowlingTeamId = request_data.get('bowlingTeamId')
        batsmanRuns = request_data.get('batsmanRuns')
        batsmanBalls = request_data.get('batsmanBalls')
        batsmanFours = request_data.get('batsmanFours')
        batsmanSixes = request_data.get('batsmanSixes')
        runs = request_data.get('runs')
        isExtra = request_data.get('isExtra')  # Get the isExtra field
        extraRuns = request_data.get('extraRuns', 0)  # Get extra runs (if any)
        isBoundary = request_data.get('isBoundary')
        overs = request_data.get('overs')  # Get overs value
        ballsInOver = request_data.get('ballsInOver')  # Get overs value
        isBowlerExtra = request_data.get('isBowlerExtra')
        bowlersballs = request_data.get('bowlersballs')
        bowlerOvers = request_data.get('bowlerOvers')
        extraType = request_data.get('extraType')

        # Validate input data
        if not matchId or not batsmanId or runs is None:
            return jsonify({'error': 'Missing required fields'}), 400

        # Establish a new database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute the stored procedure with parameters
        cursor.execute("EXEC [msd].[Add_Runs] ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?", 
                       (matchId, bowlingTeamId, battingTeamId, batsmanId, batsmanRuns, batsmanBalls, batsmanFours, batsmanSixes, bowlerId, runs, isExtra, extraRuns, isBoundary, overs, ballsInOver, isBowlerExtra, bowlersballs, bowlerOvers, extraType))

        # Commit the transaction
        conn.commit()

        # Return success message
        return jsonify({'message': 'Run details saved successfully'}), 200

    except Exception as e:
        print(f"Error processing run: {str(e)}")
        return jsonify({'error': str(e)}), 500  # Return error response on failure

@app.route('/get_IsOverCompleted', methods=['GET'])
def get_IsOverCompleted():
    try:
        # Get the matchId from the query parameters
        matchId = request.args.get('matchId')

        if not matchId:
            return jsonify({"error": "matchId is required"}), 400

        # Create a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute the stored procedure with the matchId
        cursor.execute("EXEC [msd].[Get_OverCompletionData] ?", matchId)

        # Fetch the result
        result = cursor.fetchone()

        if result:
            # Return the result as a JSON response
            is_over_completed = result[0]
            return jsonify({"IsOverCompleted": is_over_completed}), 200
        else:
            return jsonify({"error": "No data found for the provided matchId"}), 404

    except Exception as e:
    # If there's an error, log and return the error
        error_message = f"Error fetching match details: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get_NewInningsMatchData', methods=['GET'])
def get_NewInningsMatchData():
    try:
        # Get the matchId from the query parameters
        matchId = request.args.get('matchId')

        if not matchId:
            return jsonify({"error": "matchId is required"}), 400

        # Create a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute the stored procedure with the matchId
        cursor.execute("EXEC [msd].[Select_SecondBattingTeamDetails] ?", matchId)

        # Fetch the result
        result = cursor.fetchone()

        if result:
            # Return the result as a JSON response
            team_id = result[0]
            return jsonify({"TeamId": team_id}), 200
        else:
             return jsonify({"error": "No data found for the provided matchId"}), 404
    except Exception as e:
        # If there's an error, log and return the error
        error_message = f"Error fetching match details: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get_MatchEndData', methods=['GET'])
def get_MatchEndData():
    try:
        # Get the matchId from the query parameters
        matchId = request.args.get('matchId')

        if not matchId:
            return jsonify({"error": "matchId is required"}), 400

        # Create a database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Execute the stored procedure with the matchId
        cursor.execute("EXEC [msd].[IsMatchOver] ?", matchId)

        # Fetch the result
        result = cursor.fetchone()

        if result:
            # Return the result as a JSON response
            IsMatchOver = result[0]
            return jsonify({"IsMatchOver": IsMatchOver}), 200
        else:
             return jsonify({"error": "No data found for the provided matchId"}), 404
    except Exception as e:
        # If there's an error, log and return the error
        error_message = f"Error fetching match details: {str(e)}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@app.route('/get_IsInningsCompleted', methods=['GET'])
def get_IsInningsCompleted():
    try:
        matchId = request.args.get('matchId')

        if not matchId:
            return jsonify({"error": "matchId is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("EXEC [msd].[IsInningsEnded] ?", matchId)

        result = cursor.fetchone()

        if result:
            is_match_overs = result[0]
            currently_bowled_overs = result[1]

            print(f"Fetched from DB: MatchDecidedOvers={is_match_overs}, CurrentlyBowledOvers={currently_bowled_overs}")

            return jsonify({
                "MatchDecidedOvers": is_match_overs,
                "CurrentlyBowledOvers": currently_bowled_overs
            }), 200
        else:
            return jsonify({"error": "No data found for the provided matchId"}), 404
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "An error occurred while fetching match details."}), 500

@app.route('/save_inningsEnd', methods=['POST'])
def update_IsInningsCompleted():
    try:
        matchId = request.json.get('matchId')  # Get matchId from the request body

        if not matchId:
            print("matchId is missing in the request body")
            return jsonify({"error": "matchId is required"}), 400

        print(f"Received matchId: {matchId}")  # Log the received matchId

        conn = get_db_connection()
        cursor = conn.cursor()

        # Ensure you have the correct SQL query for your DB
        cursor.execute("EXEC [msd].[Update_MatchDetailsForInningsEnd] ?", matchId)

        conn.commit()

        return jsonify({'message': 'Inning End details saved successfully'}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "An error occurred while fetching match details."}), 500



@app.route('/get_scorecarddata', methods=['GET'])
def get_match_scorecard_data():
    try:
        matchId = request.args.get('matchId')  # Get the 'matchId' parameter from the URL
        conn = get_db_connection()  # Get database connection
        cursor = conn.cursor()

        # Execute the stored procedure with matchId parameter
        cursor.execute("EXEC [msd].[Select_MatchDetailsForScoreCard] @MatchId=?", (matchId,))

        # Initialize empty lists for batsmen, bowlers, and summary data
        team_a_batsman_details = []
        team_a_bowler_details = []
        team_a_summary_details = []

        # Fetch batsman data
        batsman_result = cursor.fetchall()
        for row in batsman_result:
            team_a_batsman_details.append({
                'TeamAName': row.TeamAName,
                'BatsmanName': row.BatsmanName,
                'Runs': row.Runs,
                'Balls': row.Balls,
                'Fours': row.Fours,
                'Sixes': row.Sixes,
                'StrikeRate': row.StrikeRate,
                'DismissalType': row.DismissalType
            })

        cursor.nextset()

        # Fetch bowler data
        bowler_result = cursor.fetchall()
        for row in bowler_result:
            team_a_bowler_details.append({
                'TeamBName': row.TeamBName,
                'BowlerName': row.BowlerName,
                'Overs': row.Overs,
                'Maidens': row.Maidens,
                'Runs': row.Runs,
                'Wickets': row.Wickets,
                'Average': row.Average
            })

        cursor.nextset()

        # Fetch summary data (runs, overs, wickets, extras)
        summary_result = cursor.fetchall()
        for row in summary_result:
            team_a_summary_details.append({
                'Toss': row.Toss,
                'Runs': row.Runs,
                'Overs': row.Overs,
                'Wickets': row.Wickets,
                'Wides': row.Wides,
                'NoBalls': row.NoBalls,
                'Byes': row.Byes,
                'LegByes': row.LegByes,
                'Penalities': row.Penalities,
                'TotalExtras': row.TotalExtras
            })

        cursor.close()  # Close the cursor

        # Return the structured data as JSON
        return jsonify({
            'TeamABatsmanDetails': team_a_batsman_details,
            'TeamABowlerDetails': team_a_bowler_details,
            'TeamASummaryDetails': team_a_summary_details
        })

    except Exception as e:
        # Handle exceptions and return an error response
        error_message = f"Error fetching data: {str(e)}"
        print(error_message)  # Log error to console
        return jsonify({'error': error_message}), 500  # Return error message


# CORS Headers Fix
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
