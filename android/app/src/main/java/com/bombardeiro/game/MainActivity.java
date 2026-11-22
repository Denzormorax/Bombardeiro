package com.bombardeiro.game;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;
import java.io.*;
import java.security.MessageDigest;
import java.util.HashSet;
import java.util.Set;

public class MainActivity extends Activity {
    private WebView webView;
    private static final String GAME_DIR = "bombardeiro-game";
    private static final String ASSET_ROOT = "game";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        enterImmersiveMode();
        try {
            File gameDir = new File(getFilesDir(), GAME_DIR);
            syncGameAssets(gameDir);
            webView = new WebView(this);
            webView.setBackgroundColor(0xFF101820);
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            webView.setWebViewClient(new WebViewClient());
            webView.setWebChromeClient(new WebChromeClient());
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public void exitGame() {
                    runOnUiThread(() -> finish());
                }
            }, "BombardeiroAndroid");
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(false);
            settings.setSupportZoom(false);
            settings.setBuiltInZoomControls(false);
            settings.setDisplayZoomControls(false);
            settings.setMediaPlaybackRequiresUserGesture(false);
            setContentView(webView);
            webView.loadUrl(android.net.Uri.fromFile(new File(gameDir, "bombardeirojogo.html")).toString());
        } catch (Exception error) {
            TextView message = new TextView(this);
            message.setText("Não foi possível preparar os arquivos do Bombardeiro.\n\n" + error.getMessage());
            message.setTextColor(0xFFFFFFFF);
            message.setTextSize(16);
            message.setPadding(32, 32, 32, 32);
            message.setBackgroundColor(0xFF101820);
            setContentView(message);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            moveTaskToBack(true);
            return;
        }
        webView.evaluateJavascript(
            "window.handleAndroidBack ? window.handleAndroidBack() : false",
            result -> {
                if (!"true".equals(result)) moveTaskToBack(true);
            }
        );
    }

    private void syncGameAssets(File destination) throws Exception {
        if (!destination.exists() && !destination.mkdirs()) throw new Exception("Não foi possível criar a pasta privada do jogo.");
        Set<String> expectedFiles = new HashSet<>();
        try (InputStream manifestStream = getAssets().open(ASSET_ROOT + "/assets-manifest.sha256");
             BufferedReader reader = new BufferedReader(new InputStreamReader(manifestStream, "UTF-8"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                int separator = line.indexOf("  ");
                if (separator < 1) throw new Exception("Manifesto de recursos inválido.");
                String expectedHash = line.substring(0, separator).trim();
                String relativePath = line.substring(separator + 2).trim();
                if (relativePath.isEmpty() || relativePath.startsWith("/") || relativePath.contains("..")) {
                    throw new Exception("Caminho de recurso inválido: " + relativePath);
                }
                expectedFiles.add(relativePath);
                File output = new File(destination, relativePath);
                if (!output.exists() || !expectedHash.equals(sha256(output))) {
                    File parent = output.getParentFile();
                    if (parent != null && !parent.exists() && !parent.mkdirs()) throw new Exception("Não foi possível criar uma pasta de recursos.");
                    copyAsset(ASSET_ROOT + "/" + relativePath, output);
                    if (!expectedHash.equals(sha256(output))) throw new Exception("Falha na verificação do arquivo: " + relativePath);
                }
            }
        }
        removeStaleFiles(destination, destination, expectedFiles);
    }

    private void copyAsset(String assetPath, File output) throws Exception {
        try (InputStream input = getAssets().open(assetPath); FileOutputStream out = new FileOutputStream(output)) {
            byte[] buffer = new byte[16 * 1024];
            int count;
            while ((count = input.read(buffer)) != -1) out.write(buffer, 0, count);
            out.getFD().sync();
        }
    }

    private String sha256(File file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream input = new FileInputStream(file)) {
            byte[] buffer = new byte[16 * 1024];
            int count;
            while ((count = input.read(buffer)) != -1) digest.update(buffer, 0, count);
        }
        StringBuilder result = new StringBuilder();
        for (byte value : digest.digest()) result.append(String.format("%02x", value & 0xff));
        return result.toString();
    }

    private void removeStaleFiles(File root, File current, Set<String> expected) {
        File[] children = current.listFiles();
        if (children == null) return;
        for (File child : children) {
            if (child.isDirectory()) {
                removeStaleFiles(root, child, expected);
                File[] remaining = child.listFiles();
                if (remaining != null && remaining.length == 0) child.delete();
            } else {
                String relative = root.toURI().relativize(child.toURI()).getPath();
                if (!expected.contains(relative)) child.delete();
            }
        }
    }

    private void enterImmersiveMode() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }
    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) enterImmersiveMode();
    }
    @Override protected void onDestroy() {
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
