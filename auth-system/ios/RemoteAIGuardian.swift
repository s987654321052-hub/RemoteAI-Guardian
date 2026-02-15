//
//  RemoteAIGuardian.swift
//  iOS 應用程序
//

import SwiftUI
import Combine

@main
struct RemoteAIGuardianApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

// MARK: - 主視圖
struct ContentView: View {
    @StateObject private var authManager = AuthenticationManager()
    @State private var showingSettings = false

    var body: some View {
        NavigationView {
            VStack {
                // 狀態指示器
                HStack {
                    Circle()
                        .fill(authManager.isConnected ? Color.green : Color.red)
                        .frame(width: 10, height: 10)
                    Text(authManager.isConnected ? "已連接" : "未連接")
                        .font(.caption)
                }
                .padding()

                // 配對按鈕
                if !authManager.isPaired {
                    Button(action: { authManager.requestPairing() }) {
                        Label("配對設備", systemImage: "link")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                    }
                    .padding()
                } else {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("✅ 已配對")
                            .font(.headline)
                        
                        HStack {
                            Text("設備 ID:")
                            Text(authManager.deviceId ?? "-")
                                .font(.monospaced(.caption)())
                        }
                        .font(.caption)
                    }
                    .padding()
                    .background(Color.green.opacity(0.1))
                    .cornerRadius(8)
                    .padding()
                }

                Spacer()

                // 設置按鈕
                NavigationLink(destination: SettingsView()) {
                    Label("設置", systemImage: "gear")
                }
                .padding()
            }
            .navigationTitle("RemoteAI Guardian")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingSettings = true }) {
                        Image(systemName: "ellipsis")
                    }
                }
            }
        }
    }
}

// MARK: - 認證管理器
class AuthenticationManager: NSObject, ObservableObject {
    @Published var isConnected = false
    @Published var isPaired = false
    @Published var deviceId: String?
    @Published var deviceToken: String?

    private let baseURL = "https://desktop-vil1hl8.tail1bf179.ts.net"
    private let session = URLSession.shared

    /**
     * 請求配對
     */
    func requestPairing() {
        let url = URL(string: "\(baseURL)/api/pair/request")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["deviceName": "iPhone"]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        session.dataTask(with: request) { [weak self] data, response, error in
            guard let data = data else { return }
            if let response = try? JSONDecoder().decode(PairingResponse.self, from: data) {
                DispatchQueue.main.async {
                    self?.deviceId = response.pairingId
                    self?.isPaired = true
                }
            }
        }.resume()
    }

    /**
     * 驗證連接
     */
    func verifyConnection() {
        let url = URL(string: "\(baseURL)/api/status")!
        
        session.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.isConnected = error == nil && data != nil
            }
        }.resume()
    }
}

// MARK: - 數據模型
struct PairingResponse: Codable {
    let success: Bool
    let pairingId: String
    let pairingCode: String
}

// MARK: - 設置視圖
struct SettingsView: View {
    var body: some View {
        Form {
            Section(header: Text("關於")) {
                HStack {
                    Text("版本")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.gray)
                }
            }

            Section(header: Text("服務器")) {
                HStack {
                    Text("地址")
                    Spacer()
                    Text("desktop-vil1hl8.tail1bf179.ts.net")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
        }
        .navigationTitle("設置")
    }
}

#Preview {
    ContentView()
}
