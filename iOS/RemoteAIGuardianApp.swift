import SwiftUI
import Network

/**
 * RemoteAI Guardian - iOS 原生應用
 * 用 SwiftUI 開發的完整 iOS 應用，支持命令執行和 LINE 通知
 */

@main
struct RemoteAIGuardianApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
        }
    }
}

// MARK: - Main Content View
struct ContentView: View {
    @StateObject var viewModel = DashboardViewModel()
    @State private var showCommandInput = false

    var body: some View {
        NavigationView {
            ZStack {
                // 背景
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.12, green: 0.12, blue: 0.18),
                        Color(red: 0.18, green: 0.18, blue: 0.27)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        VStack(spacing: 8) {
                            HStack {
                                Text("🚀")
                                    .font(.system(size: 32))
                                Text("RemoteAI Guardian")
                                    .font(.system(size: 24, weight: .bold))
                                    .foregroundColor(.white)
                                Spacer()
                            }
                            
                            HStack {
                                Text("iOS 控制應用")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                Spacer()
                            }
                        }
                        .padding(.horizontal)
                        .padding(.top, 16)

                        // 狀態卡片
                        StatusCardsView(viewModel: viewModel)

                        // 快速操作
                        QuickActionsView(viewModel: viewModel)

                        // 設備列表
                        DevicesListView(viewModel: viewModel)

                        // 命令執行
                        CommandExecutorView(viewModel: viewModel)

                        // Footer
                        VStack(spacing: 8) {
                            Divider()
                                .background(Color.white.opacity(0.1))

                            Text("RemoteAI Guardian v1.0.0")
                                .font(.caption)
                                .foregroundColor(.gray)

                            Text("在 LINE 上傳送命令獲得最佳體驗")
                                .font(.caption2)
                                .foregroundColor(.gray)
                        }
                        .padding(.vertical, 24)
                        .padding(.horizontal)
                    }
                    .padding(.vertical, 16)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                viewModel.startAutoRefresh()
            }
            .onDisappear {
                viewModel.stopAutoRefresh()
            }
        }
        .navigationViewStyle(.stack)
    }
}

// MARK: - Status Cards
struct StatusCardsView: View {
    @ObservedObject var viewModel: DashboardViewModel

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                StatusCardView(
                    title: "系統狀態",
                    value: viewModel.isOnline ? "✅ 在線" : "❌ 離線",
                    valueColor: viewModel.isOnline ? .green : .red
                )

                StatusCardView(
                    title: "已配對設備",
                    value: "\(viewModel.pairedDevicesCount)",
                    valueColor: .blue
                )
            }

            HStack(spacing: 12) {
                StatusCardView(
                    title: "活躍令牌",
                    value: "\(viewModel.activeTokensCount)",
                    valueColor: .cyan
                )

                StatusCardView(
                    title: "運行時間",
                    value: viewModel.uptime,
                    valueColor: .orange
                )
            }
        }
        .padding(.horizontal)
    }
}

struct StatusCardView: View {
    let title: String
    let value: String
    let valueColor: Color

    var body: some View {
        VStack(spacing: 8) {
            HStack(spacing: 4) {
                Circle()
                    .fill(valueColor)
                    .frame(width: 8, height: 8)

                Text(title)
                    .font(.caption)
                    .foregroundColor(.gray)
                    .textTransform(.uppercase)

                Spacer()
            }

            Text(value)
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(valueColor)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(12)
        .background(Color.white.opacity(0.08))
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.white.opacity(0.12), lineWidth: 1)
        )
    }
}

// MARK: - Quick Actions
struct QuickActionsView: View {
    @ObservedObject var viewModel: DashboardViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("快速操作")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.cyan)

                Circle()
                    .fill(Color.cyan)
                    .frame(width: 4, height: 4)

                Spacer()
            }
            .padding(.horizontal)

            VStack(spacing: 8) {
                HStack(spacing: 8) {
                    QuickActionButton(
                        icon: "🐳",
                        title: "Docker PS",
                        action: { viewModel.executeCommand("docker ps") }
                    )

                    QuickActionButton(
                        icon: "📊",
                        title: "系統統計",
                        action: { viewModel.executeCommand("docker stats --no-stream") }
                    )
                }

                HStack(spacing: 8) {
                    QuickActionButton(
                        icon: "📁",
                        title: "列表文件",
                        action: { viewModel.executeCommand("dir") }
                    )

                    QuickActionButton(
                        icon: "⚙️",
                        title: "任務列表",
                        action: { viewModel.executeCommand("tasklist") }
                    )
                }
            }
            .padding(.horizontal)
        }
    }
}

struct QuickActionButton: View {
    let icon: String
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Text(icon)
                    .font(.system(size: 20))

                Text(title)
                    .font(.caption2)
                    .foregroundColor(.cyan)
            }
            .frame(maxWidth: .infinity)
            .padding(12)
            .background(Color.cyan.opacity(0.08))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.cyan.opacity(0.2), lineWidth: 1)
            )
        }
    }
}

// MARK: - Devices List
struct DevicesListView: View {
    @ObservedObject var viewModel: DashboardViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("已配對設備")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.cyan)

                Circle()
                    .fill(Color.cyan)
                    .frame(width: 4, height: 4)

                Spacer()

                Text("\(viewModel.devices.count)")
                    .font(.caption)
                    .foregroundColor(.cyan)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.cyan.opacity(0.2))
                    .cornerRadius(4)
            }
            .padding(.horizontal)

            VStack(spacing: 10) {
                if viewModel.devices.isEmpty {
                    Text("暫無已配對設備")
                        .font(.caption)
                        .foregroundColor(.gray)
                        .frame(maxWidth: .infinity)
                        .padding(16)
                } else {
                    ForEach(viewModel.devices, id: \.deviceName) { device in
                        DeviceItemView(device: device)
                    }
                }
            }
            .padding(.horizontal)
        }
    }
}

struct DeviceItemView: View {
    let device: Device

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(device.deviceName)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)

                HStack(spacing: 4) {
                    Circle()
                        .fill(device.isActive ? Color.green : Color.gray)
                        .frame(width: 6, height: 6)

                    Text(device.status)
                        .font(.caption)
                        .foregroundColor(device.isActive ? .green : .gray)
                }
            }

            Spacer()

            Text(device.status)
                .font(.caption2)
                .foregroundColor(.cyan)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.cyan.opacity(0.2))
                .cornerRadius(4)
        }
        .padding(12)
        .background(Color.white.opacity(0.08))
        .cornerRadius(10)
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(Color.cyan.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - Command Executor
struct CommandExecutorView: View {
    @ObservedObject var viewModel: DashboardViewModel
    @State private var command = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("執行命令")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.cyan)

                Circle()
                    .fill(Color.cyan)
                    .frame(width: 4, height: 4)

                Spacer()
            }
            .padding(.horizontal)

            VStack(spacing: 12) {
                HStack(spacing: 10) {
                    TextField("輸入命令...", text: $command)
                        .textFieldStyle(.roundedBorder)
                        .foregroundColor(.white)

                    Button(action: {
                        viewModel.executeCommand(command)
                        command = ""
                    }) {
                        Text("執行")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.black)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(
                                LinearGradient(
                                    gradient: Gradient(colors: [.cyan, .blue]),
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .cornerRadius(6)
                    }
                    .disabled(command.isEmpty)
                }

                if !viewModel.commandOutput.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("輸出")
                            .font(.caption)
                            .foregroundColor(.gray)

                        ScrollView {
                            Text(viewModel.commandOutput)
                                .font(.system(size: 11, design: .monospaced))
                                .foregroundColor(.cyan)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(10)
                        }
                        .frame(maxHeight: 200)
                        .background(Color.black.opacity(0.5))
                        .cornerRadius(8)
                    }
                }
            }
            .padding(.horizontal)
        }
    }
}

// MARK: - View Model
class DashboardViewModel: ObservableObject {
    @Published var isOnline = false
    @Published var pairedDevicesCount = 0
    @Published var activeTokensCount = 0
    @Published var uptime = "--:--"
    @Published var devices: [Device] = []
    @Published var commandOutput = ""

    private var refreshTimer: Timer?
    private let apiBaseURL = "http://localhost:9999"

    func startAutoRefresh() {
        refreshStatus()
        refreshTimer = Timer.scheduledTimer(withTimeInterval: 5, repeats: true) { _ in
            self.refreshStatus()
        }
    }

    func stopAutoRefresh() {
        refreshTimer?.invalidate()
    }

    func refreshStatus() {
        URLSession.shared.dataTask(with: URL(string: "\(apiBaseURL)/api/dashboard/status")!) { data, _, _ in
            guard let data = data else { return }

            do {
                let response = try JSONDecoder().decode(StatusResponse.self, from: data)
                DispatchQueue.main.async {
                    self.isOnline = response.success
                    self.pairedDevicesCount = response.pairedDevices
                    self.activeTokensCount = response.activeTokens
                }
            } catch {
                DispatchQueue.main.async {
                    self.isOnline = false
                }
            }
        }.resume()

        URLSession.shared.dataTask(with: URL(string: "\(apiBaseURL)/api/dashboard/devices")!) { data, _, _ in
            guard let data = data else { return }

            do {
                let response = try JSONDecoder().decode(DevicesResponse.self, from: data)
                DispatchQueue.main.async {
                    self.devices = response.devices ?? []
                }
            } catch {}
        }.resume()
    }

    func executeCommand(_ command: String) {
        guard !command.isEmpty else { return }

        let payload = ["command": command]
        guard let jsonData = try? JSONEncoder().encode(payload) else { return }

        var request = URLRequest(url: URL(string: "\(apiBaseURL)/api/dashboard/execute")!)
        request.httpMethod = "POST"
        request.httpBody = jsonData
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        URLSession.shared.dataTask(with: request) { data, _, _ in
            guard let data = data else { return }

            do {
                let response = try JSONDecoder().decode(ExecuteResponse.self, from: data)
                DispatchQueue.main.async {
                    self.commandOutput = response.output ?? response.error ?? "執行失敗"
                }
            } catch {
                DispatchQueue.main.async {
                    self.commandOutput = "解析響應失敗"
                }
            }
        }.resume()
    }
}

// MARK: - Models
struct Device: Codable {
    let deviceName: String
    let status: String
    let confirmedAt: String?
    let hasActiveToken: Bool

    var isActive: Bool {
        status == "CONFIRMED" && hasActiveToken
    }
}

struct StatusResponse: Codable {
    let success: Bool
    let pairedDevices: Int
    let activeTokensCount: Int

    enum CodingKeys: String, CodingKey {
        case success
        case pairedDevices = "pairedDevices"
        case activeTokensCount = "activeTokens"
    }
}

struct DevicesResponse: Codable {
    let success: Bool
    let devices: [Device]?
}

struct ExecuteResponse: Codable {
    let success: Bool
    let output: String?
    let error: String?
}

#Preview {
    ContentView()
}
