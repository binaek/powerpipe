load "$LIB_BATS_ASSERT/load.bash"
load "$LIB_BATS_SUPPORT/load.bash"

@test "simple dashboard test" {
  # run a dashboard and shapshot the output
  run powerpipe dashboard run sibling_containers_report --export test.pps --output none --mod-location "$FILE_PATH/test_data/mods/dashboard_sibling_containers"

  # get the patch diff between the two snapshots
  run jd -f patch $SNAPSHOTS_DIR/expected_sps_sibling_containers_report.json test.pps

  # run the script to evaluate the patch
  # returns nothing if there is no diff(except start_time, end_time & search_path)
  diff=$($FILE_PATH/json_patch.sh $output)
  echo $diff
  rm -f test.pps

  # check if there is no diff returned by the script
  assert_equal "$diff" ""
}

@test "dashboard with 'with' blocks" {
  # run a dashboard and shapshot the output
  run powerpipe dashboard run testing_with_blocks --export test.pps --output none --mod-location "$FILE_PATH/test_data/mods/dashboard_withs"

  # sort the panels data by 'name' using jq sort_by(for ease in comparison)
  cat test.pps | jq '.panels."dashbaord_withs.graph.with_testing".data.columns|=sort_by(.name)' > test2.json

  # get the patch diff between the two snapshots
  run jd -f patch $SNAPSHOTS_DIR/expected_sps_many_withs_dashboard.json test2.json

  # run the script to evaluate the patch
  # returns nothing if there is no diff(except start_time, end_time & search_path)
  diff=$($FILE_PATH/json_patch.sh $output)
  echo $diff
  rm -f test.pps
  rm -f test2.json

  # check if there is no diff returned by the script
  assert_equal "$diff" ""
}

@test "dashboard with 'text' blocks" {
  # run a dashboard and shapshot the output
  run powerpipe dashboard run testing_text_blocks --export test.pps --output none --mod-location "$FILE_PATH/test_data/mods/dashboard_texts"

  # get the patch diff between the two snapshots
  run jd -f patch $SNAPSHOTS_DIR/expected_sps_testing_text_blocks_dashboard.json test.pps

  # run the script to evaluate the patch
  # returns nothing if there is no diff(except start_time, end_time & search_path)
  diff=$($FILE_PATH/json_patch.sh $output)
  echo $diff
  rm -f test.pps

  # check if there is no diff returned by the script
  assert_equal "$diff" ""
}

@test "dashboard with 'card' blocks" {
  # run a dashboard and shapshot the output
  run powerpipe dashboard run testing_card_blocks --export test.pps --output none --mod-location "$FILE_PATH/test_data/mods/dashboard_cards"

  # get the patch diff between the two snapshots
  run jd -f patch $SNAPSHOTS_DIR/expected_sps_testing_card_blocks_dashboard.json test.pps


  # run the script to evaluate the patch
  # returns nothing if there is no diff(except start_time, end_time & search_path)
  diff=$($FILE_PATH/json_patch.sh $output)
  echo $diff
  rm -f test.pps

  # check if there is no diff returned by the script
  assert_equal "$diff" ""
}

@test "dashboard with node and edge blocks" {
  # run a dashboard and shapshot the output
  run powerpipe dashboard run testing_nodes_and_edges --export test.pps --output none --mod-location "$FILE_PATH/test_data/mods/dashboard_graphs"

  # sort the panels data by 'name' using jq sort_by(for ease in comparison)
  cat test.pps | jq '.panels."dashboard_graphs.graph.node_and_edge_testing".data.columns|=sort_by(.name)' > test2.json

  # get the patch diff between the two snapshots
  run jd -f patch $SNAPSHOTS_DIR/expected_sps_testing_nodes_and_edges_dashboard.json test2.json

  # run the script to evaluate the patch
  # returns nothing if there is no diff(except start_time, end_time & search_path)
  diff=$($FILE_PATH/json_patch.sh $output)
  echo $diff
  rm -f test.pps
  rm -f test2.json

  # check if there is no diff returned by the script
  assert_equal "$diff" ""
}

@test "dashboard with 'input' and test --arg" {
  # run a dashboard and shapshot the output
  run powerpipe dashboard run testing_dashboard_inputs --export test.pps --output none --mod-location "$FILE_PATH/test_data/mods/dashboard_inputs" --arg new_input=test

  # get the patch diff between the two snapshots
  run jd -f patch $SNAPSHOTS_DIR/expected_sps_testing_dashboard_inputs.json test.pps

  # run the script to evaluate the patch
  # returns nothing if there is no diff(except start_time, end_time & search_path)
  diff=$($FILE_PATH/json_patch.sh $output)
  echo $diff
  rm -f test.pps

  # check if there is no diff returned by the script
  assert_equal "$diff" ""
}


@test "dashboard input with base" {
  # run a dashboard and shapshot the output
  run powerpipe dashboard run resource_details --export test.pps --output none --mod-location "$FILE_PATH/test_data/mods/dashboard_inputs_with_base"

  # get the patch diff between the two snapshots
  run jd -f patch $SNAPSHOTS_DIR/expected_sps_testing_dashboard_inputs_with_base.json test.pps
  echo $output

  # run the script to evaluate the patch
  # returns nothing if there is no diff(except start_time, end_time & search_path)
  diff=$($FILE_PATH/json_patch.sh $output)
  echo $diff
  rm -f test.pps

  # check if there is no diff returned by the script
  assert_equal "$diff" ""
}
