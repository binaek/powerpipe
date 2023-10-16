OUTPUT_DIR?=/usr/local/bin

steampipe:
	go build -o ${OUTPUT_DIR}/powerpipe

dashboard_assets:
	$(MAKE) -C ui/dashboard

all:
	$(MAKE) -C ui/dashboard
	go build -o ${OUTPUT_DIR}/steampipe
